<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DashboardStatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $statsService;

    public function __construct(DashboardStatsService $statsService)
    {
        $this->statsService = $statsService;
    }

    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        // محاسبه و اعطای پاداش‌های خودکار
        $this->statsService->handleDailyRewards($user);

        // داده‌های مشترک
        $commonData = [
            'quickAccess' => $this->statsService->getQuickAccessItems($user)
        ];

        // --- ADMIN DASHBOARD ---
        if ($user->hasRole('super-admin') || $user->hasRole('admin')) {
            $stats = $this->statsService->getAdminStats();
            $recent_activities = $this->statsService->getRecentActivities();
            
            $latest_users = User::latest()->take(5)->get()->map(function($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->full_name,
                    'mobile' => $u->mobile,
                    'joined_at' => $u->created_at_jalali,
                    'avatar' => $u->avatar
                ];
            });

            $registration_chart = User::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->get()
                ->pluck('count', 'date');

            return Inertia::render('Dashboard', array_merge($commonData, [
                'isAdmin' => true,
                'stats' => $stats,
                'recentActivities' => $recent_activities,
                'latestUsers' => $latest_users,
                'chartData' => $registration_chart,
            ]));
        }

        // --- USER DASHBOARD ---
        $stats = $this->statsService->getUserStats($user);

        $recent_transactions = $user->pointTransactions()
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($tx) {
                $tx->type_farsi = $tx->getTypeFarsi();
                $tx->amount_with_sign = $tx->amount_with_sign;
                $tx->created_at_jalali = $tx->created_at_jalali;
                return $tx;
            });

        return Inertia::render('Dashboard', array_merge($commonData, [
            'isAdmin' => false,
            'stats' => $stats,
            'recentTransactions' => $recent_transactions,
        ]));
    }

    public function updateQuickAccess(Request $request)
    {
        $request->validate(['items' => 'required|array']);
        
        $user = auth()->user();
        $prefs = $user->dashboard_preferences ?? [];
        $prefs['quick_access'] = $request->items;
        
        $user->dashboard_preferences = $prefs;
        $user->save();

        return back()->with('message', 'دسترسی سریع بروزرسانی شد.');
    }
}