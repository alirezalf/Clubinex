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
        $user = $request->user();

        // 1. Theme Settings via Service
        $activeTheme = $this->themeService->getActiveTheme($user);

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
            // 2. Badges & Notifications (Lazy Evaluation)
            'unreadNotificationsCount' => fn () => $user ? $user->unreadNotifications()->count() : 0,
            'badges' => fn () => $this->getBadges($user),
            'themeSettings' => $activeTheme,
            // 4. Login Settings (Lazy Evaluation)
            'loginSettings' => fn () => \Illuminate\Support\Facades\Cache::remember('login_settings', 3600, function () {
                return SystemSetting::where('group', 'login')->pluck('value', 'key')->toArray();
            }),
            // 3. دریافت هوشمند اسلایدر برای صفحه جاری (Lazy Evaluation)
            'pageSlider' => fn () => $this->getPageSlider($request),
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

    private function getBadges($user)
    {
        $ticketBadges = ['user' => 0, 'admin' => 0, 'rewards' => 0];

        if ($user) {
            $ticketBadges['user'] = Ticket::where('user_id', $user->id)
                ->where('status', 'answered')
                ->count();

            if ($user->hasRole(['super-admin', 'admin', 'staff'])) {
                $query = Ticket::whereIn('status', ['open', 'customer_reply']);
                if (!$user->hasRole('super-admin')) {
                    $query->where('assigned_to', $user->id);
                }
                $ticketBadges['admin'] = $query->count();

                // Count pending reward redemptions
                $ticketBadges['rewards'] = \App\Models\RewardRedemption::where('status', 'pending')->count();
            }
        }

        return $ticketBadges;
    }

    private function getPageSlider(Request $request)
    {
        if ($request->isMethod('GET') && !$request->wantsJson()) {
            $currentRoute = Route::currentRouteName();
            if ($currentRoute) {
                return Slider::with('activeSlides')
                    ->where('location_key', $currentRoute)
                    ->where('is_active', true)
                    ->first();
            }
        }
        return null;
    }
}
