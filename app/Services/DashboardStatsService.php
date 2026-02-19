<?php

namespace App\Services;

use App\Models\User;
use App\Models\Club;
use App\Models\ActivityLog;
use App\Models\RewardRedemption;
use App\Models\PointTransaction;
use App\Models\PointRule;
use App\Models\UserSession;
use Illuminate\Support\Facades\DB;

class DashboardStatsService
{
    /**
     * مدیریت پاداش‌های ورود روزانه و استریک ماهانه
     * بهینه‌سازی شده برای جلوگیری از کوئری‌های سنگین تکراری
     */
    public function handleDailyRewards(User $user)
    {
        // Cache checking to reduce DB hits on every page load
        $cacheKey = "daily_rewards_checked_{$user->id}_" . date('Y-m-d');
        
        if (cache()->has($cacheKey)) {
            return;
        }

        // 1. پاداش بازدید روزانه
        $visitRule = PointRule::where('action_code', 'visit_site')->active()->first();
        if ($visitRule) {
            $hasVisitedToday = PointTransaction::where('user_id', $user->id)
                ->where('point_rule_id', $visitRule->id)
                ->whereDate('created_at', today())
                ->exists();

            if (!$hasVisitedToday) {
                $maxDaily = 1000;
                $todayEarned = PointTransaction::where('user_id', $user->id)
                    ->earned()
                    ->whereDate('created_at', today())
                    ->sum('amount');

                if ($todayEarned < $maxDaily) {
                    PointTransaction::awardPoints(
                        $user->id,
                        $visitRule->points,
                        $visitRule->id,
                        'امتیاز بازدید روزانه'
                    );
                }
            }
        }

        // 2. پاداش وفاداری ماهانه (۳۰ روز بازدید)
        $streakRule = PointRule::where('action_code', 'monthly_streak')->active()->first();
        if ($streakRule) {
            $recentlyRewarded = PointTransaction::where('user_id', $user->id)
                ->where('point_rule_id', $streakRule->id)
                ->where('created_at', '>=', now()->subDays(5))
                ->exists();

            if (!$recentlyRewarded) {
                // Optimized Query: Count distinct days directly in SQL
                $distinctDays = PointTransaction::where('user_id', $user->id)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->selectRaw('count(distinct date(created_at)) as count')
                    ->value('count');

                if ($distinctDays >= 30) {
                    PointTransaction::awardPoints(
                        $user->id,
                        $streakRule->points,
                        $streakRule->id,
                        'پاداش وفاداری ماهانه (۳۰ روز بازدید)'
                    );
                }
            }
        }

        // ثبت در کش برای جلوگیری از اجرای مجدد در همین روز
        cache()->put($cacheKey, true, now()->endOfDay());
    }

    public function getAdminStats()
    {
        return cache()->remember('admin_dashboard_stats', 300, function () {
            return [
                'total_users' => User::count(),
                'new_users_today' => User::whereDate('created_at', today())->count(),
                'pending_rewards' => RewardRedemption::where('status', 'pending')->count(),
                'total_points_distributed' => PointTransaction::earned()->sum('amount'),
            ];
        });
    }

    public function getUserStats(User $user)
    {
        $currentClub = $user->club;
        $nextClub = $currentClub ? $currentClub->getNextTier() : Club::tiers()->orderBy('min_points')->first();

        $progress = 100;
        $pointsNeeded = 0;

        if ($nextClub) {
            $minPoints = $currentClub ? $currentClub->min_points : 0;
            $range = $nextClub->min_points - $minPoints;
            
            if ($range > 0) {
                $currentInLevel = $user->current_points - $minPoints;
                $progress = min(100, max(0, ($currentInLevel / $range) * 100));
            }
            
            $pointsNeeded = max(0, $nextClub->min_points - $user->current_points);
        }

        return [
            'points' => (int) ($user->current_points ?? 0),
            'referrals' => $user->getDirectReferralsCountAttribute(),
            'club' => $currentClub ? $currentClub->name : 'سطح پایه',
            'club_color' => $currentClub ? $currentClub->color : '#64748b',
            'club_icon' => $currentClub ? $currentClub->icon : 'star',
            'next_club' => $nextClub ? $nextClub->name : 'بالاترین سطح',
            'progress_percent' => round($progress),
            'points_needed' => $pointsNeeded
        ];
    }

    public function getRecentActivities()
    {
        return ActivityLog::with('user')
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->full_name : 'سیستم',
                    'description' => $log->description,
                    'time' => $log->created_at->diffForHumans(),
                    'action_group' => $log->action_group
                ];
            });
    }

    public function getQuickAccessItems(User $user)
    {
        $pinned = $user->dashboard_preferences['quick_access'] ?? [];
        
        $frequent = cache()->remember("user_frequent_pages_{$user->id}", 3600, function () use ($user) {
            return UserSession::where('user_id', $user->id)
                ->select('page_url', DB::raw('count(*) as total'))
                ->groupBy('page_url')
                ->orderByDesc('total')
                ->take(5)
                ->get()
                ->map(function($session) {
                    if (str_contains($session->page_url, 'rewards')) return 'rewards';
                    if (str_contains($session->page_url, 'lucky-wheel')) return 'lucky_wheel';
                    if (str_contains($session->page_url, 'products')) return 'products';
                    if (str_contains($session->page_url, 'surveys')) return 'surveys';
                    if (str_contains($session->page_url, 'tickets')) return 'tickets';
                    if (str_contains($session->page_url, 'profile')) return 'profile';
                    if (str_contains($session->page_url, 'referrals')) return 'referrals';
                    return null;
                })
                ->filter()
                ->unique()
                ->values()
                ->toArray();
        });

        return [
            'pinned' => $pinned,
            'frequent' => $frequent
        ];
    }
}
