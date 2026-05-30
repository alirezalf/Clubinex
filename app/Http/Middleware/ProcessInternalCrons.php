<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\RewardRedemption;
use Illuminate\Support\Carbon;

class ProcessInternalCrons
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Cache::has('daily_internal_crons_run')) {
            Cache::put('daily_internal_crons_run', true, now()->addHours(24));

            try {
                $this->expirePoints();
                $this->tagUsers();
            } catch (\Exception $e) {
                \Log::error('خطا در اجرای توابع داخلی روزانه (Internal Crons): ' . $e->getMessage());
            }
        }

        return $next($request);
    }

    private function expirePoints()
    {
        $now = Carbon::now();
        $usersToProcess = User::where('current_points', '>', 0)
            ->whereHas('pointTransactions', function($query) use ($now) {
                $query->where('type', 'earn')
                      ->whereNotNull('expires_at')
                      ->where('expires_at', '<=', $now);
            })->get();

        foreach ($usersToProcess as $user) {
            DB::transaction(function() use ($user, $now) {
                $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
                if (!$lockedUser || $lockedUser->current_points <= 0) return;

                $transactions = PointTransaction::where('user_id', $lockedUser->id)
                    ->orderBy('created_at', 'asc')
                    ->get();

                $totalSpent = 0;
                foreach ($transactions as $tx) {
                    if ($tx->amount <= 0) {
                        $totalSpent += abs($tx->amount);
                    }
                }

                $remainedToSpend = $totalSpent;
                $pointsToExpireNow = 0;

                foreach ($transactions as $tx) {
                    if ($tx->type === 'earn') {
                        if ($remainedToSpend >= $tx->amount) {
                            $remainedToSpend -= $tx->amount;
                        } else {
                            $unspentPortion = $tx->amount - $remainedToSpend;
                            $remainedToSpend = 0;

                            if ($tx->expires_at && Carbon::parse($tx->expires_at)->lte($now)) {
                                $pointsToExpireNow += $unspentPortion;
                            }
                        }
                    }
                }

                if ($pointsToExpireNow > 0) {
                    $pointsToExpireNow = min($pointsToExpireNow, $lockedUser->current_points);
                    PointTransaction::createTransaction([
                        'user_id' => $lockedUser->id,
                        'type' => 'expire',
                        'amount' => -$pointsToExpireNow,
                        'description' => 'انقضای سیستمی امتیازات تاریخ‌گذشته',
                    ]);

                    // مرحله 12: اتوماسیون بازاریابی (Trigger Marketing) - ارسال اطلاع رسانی انقضای امتیاز
                    try {
                        \Illuminate\Support\Facades\Notification::send(
                            $lockedUser,
                            new \App\Notifications\SystemNotification(
                                'انقضای امتیازات',
                                "متاسفانه $pointsToExpireNow امتیاز شما به دلیل پایان مهلت استفاده، منقضی شد."
                            )
                        );
                    } catch (\Exception $e) {}
                }
            });
        }
    }

    private function tagUsers()
    {
        User::chunk(200, function ($users) {
            foreach ($users as $user) {
                $tags = is_array($user->tags) ? $user->tags : [];
                $newTags = [];
                $becameInactive = false;

                if (!$user->last_login_at || Carbon::parse($user->last_login_at)->lt(now()->subDays(30))) {
                    $newTags[] = 'inactive';
                    if (!in_array('inactive', $tags)) {
                        $becameInactive = true;
                    }
                } else {
                    $newTags[] = 'active';
                }

                $discountCount = RewardRedemption::where('user_id', $user->id)
                    ->join('rewards', 'reward_redemptions.reward_id', '=', 'rewards.id')
                    ->where('rewards.type', 'discount_code')
                    ->count();
                if ($discountCount >= 2) {
                    $newTags[] = 'discount_lover';
                }

                if ($user->current_points >= 10000) {
                    $newTags[] = 'top_earner';
                }

                $manualTags = array_filter($tags, fn($tag) => !in_array($tag, ['inactive', 'active', 'discount_lover', 'top_earner']));
                $finalTags = array_values(array_unique(array_merge($manualTags, $newTags)));

                sort($tags);
                sort($finalTags);
                if ($tags !== $finalTags) {
                    User::where('id', $user->id)->update(['tags' => json_encode($finalTags)]);

                    // مرحله 12: ارسال پیامک بازگردانی کاربر (Win-back) در صورت غیرفعال شدن
                    if ($becameInactive && $user->mobile) {
                        try {
                            $message = 'دلتنگ شما هستیم! بیش از یک ماه است که به باشگاه مشتریان سر نزده‌اید. با ورود مجدد از تخفیف‌های ویژه بهره‌مند شوید.';
                            \App\Jobs\SendSms::dispatch($user->mobile, $message, $user->id);
                        } catch (\Exception $e) {}
                    }
                }
            }
        });
    }
}
