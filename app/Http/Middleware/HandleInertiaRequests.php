<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Ticket;
use App\Models\SystemSetting;
use App\Models\Slider;
use Illuminate\Support\Facades\Route;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $ticketBadges = ['user' => 0, 'admin' => 0];
        $user = $request->user();

        // 1. تنظیمات سیستم
        $settings = cache()->remember('global_settings', 3600, function () {
            return SystemSetting::getSettingsArray();
        });

        $activeTheme = [
            'primary_color' => $settings['theme.primary_color'] ?? '#0284c7',
            'radius_size' => $settings['theme.radius_size'] ?? '0.75rem',
            'sidebar_bg' => $settings['theme.sidebar_bg'] ?? '#ffffff',
            'sidebar_text' => $settings['theme.sidebar_text'] ?? '#1f2937',
            'sidebar_texture' => $settings['theme.sidebar_texture'] ?? 'none',
            'header_bg' => $settings['theme.header_bg'] ?? 'rgba(255,255,255,0.8)',
            'sidebar_collapsed' => filter_var($settings['theme.sidebar_collapsed'] ?? false, FILTER_VALIDATE_BOOLEAN),
        ];

        if ($user && !empty($user->theme_preferences) && is_array($user->theme_preferences)) {
            foreach ($user->theme_preferences as $key => $value) {
                if (!empty($value)) {
                    $activeTheme[$key] = $value;
                }
            }
        }

        // 2. بج‌ها و اعلان‌ها
        $unreadNotificationsCount = 0;
        if ($user) {
            $unreadNotificationsCount = $user->unreadNotifications()->count();
            
            $ticketBadges['user'] = Ticket::where('user_id', $user->id)
                ->where('status', 'answered')
                ->count();

            if ($user->hasRole(['super-admin', 'admin', 'staff'])) {
                $query = Ticket::whereIn('status', ['open', 'customer_reply']);
                if (!$user->hasRole('super-admin')) {
                    $query->where('assigned_to', $user->id);
                }
                $ticketBadges['admin'] = $query->count();
            }
        }

        // 3. دریافت هوشمند اسلایدر برای صفحه جاری
        // فقط برای درخواست‌های GET و صفحات اصلی اجرا شود
        $pageSlider = null;
        if ($request->isMethod('GET') && !$request->wantsJson()) {
            $currentRoute = Route::currentRouteName();
            if ($currentRoute) {
                // تلاش برای یافتن اسلایدر متصل به این روت
                $pageSlider = Slider::with('activeSlides')
                    ->where('location_key', $currentRoute)
                    ->where('is_active', true)
                    ->first();
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'mobile' => $user->mobile,
                    'avatar' => $user->avatar,
                    'roles' => $user->getRoleNames(),
                    'points' => $user->current_points,
                ] : null,
            ],
            'unreadNotificationsCount' => $unreadNotificationsCount,
            'themeSettings' => $activeTheme,
            'badges' => $ticketBadges,
            'pageSlider' => $pageSlider, // اسلایدر سراسری
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
        ]);
    }
}