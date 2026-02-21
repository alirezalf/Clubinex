<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Ticket;
use App\Models\SystemSetting;
use App\Models\Slider;
use Illuminate\Support\Facades\Route;

use App\Services\ThemeService;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $ticketBadges = ['user' => 0, 'admin' => 0];
        $user = $request->user();

        // 1. Theme Settings via Service
        $activeTheme = $this->themeService->getActiveTheme($user);

        // 2. Badges & Notifications
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
