<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agent;
use App\Models\PointTransaction;
use App\Models\PointRule;
use App\Models\ActivityLog;
use App\Http\Requests\ProfileUpdateRequest; // Import Request
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Services\ThemeService;

class ProfileController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function show()
    {
        /** @var User $user */
        $user = auth()->user();
        $user->load('club');
        $nextClub = $user->club ? $user->club->getNextTier() : \App\Models\Club::tiers()->orderBy('min_points')->first();
        $agent = Agent::where('user_id', $user->id)->first();

        $userData = $user->toArray();
        $userData['is_agent'] = !is_null($agent);
        $userData['agent_code'] = $agent ? $agent->agent_code : '';
        $userData['store_name'] = $agent ? $agent->store_name : '';

        if ($user->club) {
            $userData['club']['next_club'] = $nextClub;
        } else {
            $userData['club'] = [
                'name' => 'سطح پایه',
                'color' => '#64748b',
                'id' => 0,
                'min_points' => 0,
                'next_club' => $nextClub
            ];
        }

        $provinces = \Illuminate\Support\Facades\Cache::remember('iran_provinces', 86400, function() {
            return DB::table('provinces')->where('is_active', true)->select('id', 'name')->get();
        });
        $cities = $user->province_id
            ? \Illuminate\Support\Facades\Cache::remember('iran_cities_prov_' . $user->province_id, 86400, function() use ($user) {
                return DB::table('cities')->where('province_id', $user->province_id)->select('id', 'name')->get();
            })
            : [];

        return Inertia::render('Profile', [
            'user' => $userData,
            'provinces' => $provinces,
            'initialCities' => $cities,
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && !$user->hasVerifiedEmail(),
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $validated = $request->validated();

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::delete(str_replace('/storage/', 'public/', $user->avatar));
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = Storage::url($path);
        } else {
            unset($validated['avatar']);
        }

        // Handle Agent Logic
        if ($request->boolean('is_agent')) {
            $exists = Agent::where('agent_code', $request->agent_code)->where('user_id', '!=', $user->id)->exists();
            if ($exists) return back()->withErrors(['agent_code' => 'این کد نمایندگی قبلاً ثبت شده است.']);

            Agent::updateOrCreate(['user_id' => $user->id], [
                'agent_code' => $request->agent_code,
                'store_name' => $request->store_name,
                'is_active' => false, // نمایندگان باید تایید شوند
            ]);
        }

        // Cleanup user fields
        unset($validated['is_agent']);
        unset($validated['agent_code']);
        unset($validated['store_name']);

        $user->fill($validated);

        // Check if email changed
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Profile Completion Reward
        if ($user->profile_completion_percentage == 100) {
            $alreadyRewarded = PointTransaction::where('user_id', $user->id)
                ->whereHas('pointRule', function($q) { $q->where('action_code', 'complete_profile'); })->exists();

            if (!$alreadyRewarded) {
                $rule = PointRule::where('action_code', 'complete_profile')->first();
                if ($rule && $rule->is_active) {
                    PointTransaction::awardPoints($user->id, $rule->points, $rule->id, 'پاداش تکمیل پروفایل کاربری');
                    $user->completeProfile();
                    return back()->with('message', "پروفایل بروزرسانی شد. تبریک! {$rule->points} امتیاز تکمیل پروفایل دریافت کردید.");
                }
            }
        }

        return back()->with('message', 'پروفایل با موفقیت بروزرسانی شد.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        auth()->user()->update(['password' => Hash::make($validated['password'])]);
        ActivityLog::log('user.password_change', 'تغییر رمز عبور توسط کاربر', ['user_id' => auth()->id()]);

        return back()->with('message', 'رمز عبور با موفقیت تغییر کرد.');
    }

    public function updateTheme(Request $request)
    {
        $user = auth()->user();
        $this->themeService->updateUserTheme($user, $request->all());

        return back()->with('message', 'تنظیمات ظاهری شما شخصی‌سازی شد.');
    }

    public function sessions()
    {
        $sessions = DB::table('sessions')
                      ->where('user_id', auth()->id())
                      ->orderBy('last_activity', 'desc')
                      ->get()
                      ->map(function ($session) {
                          $isCurrent = $session->id === request()->session()->getId();

                          $agent = $session->user_agent;
                          $device = 'کامپیوتر';
                          if (strpos($agent, 'Mobile') !== false) {
                              $device = 'موبایل';
                          } elseif (strpos($agent, 'Tablet') !== false) {
                              $device = 'تبلت';
                          }

                          $browser = 'ناشناس';
                          if (strpos($agent, 'Chrome') !== false) {
                              $browser = 'Chrome';
                          } elseif (strpos($agent, 'Firefox') !== false) {
                              $browser = 'Firefox';
                          } elseif (strpos($agent, 'Safari') !== false) {
                              $browser = 'Safari';
                          }

                          $platform = 'ناشناس';
                          if (strpos($agent, 'Windows') !== false) {
                              $platform = 'Windows';
                          } elseif (strpos($agent, 'Mac') !== false) {
                              $platform = 'MacOS';
                          } elseif (strpos($agent, 'Linux') !== false) {
                              $platform = 'Linux';
                          } elseif (strpos($agent, 'Android') !== false) {
                              $platform = 'Android';
                          } elseif (strpos($agent, 'iPhone') !== false || strpos($agent, 'iPad') !== false) {
                              $platform = 'iOS';
                          }

                          return [
                              'id' => $session->id,
                              'ip_address' => $session->ip_address,
                              'is_current_device' => $isCurrent,
                              'device' => $device,
                              'browser' => $browser,
                              'platform' => $platform,
                              'last_active' => \Morilog\Jalali\Jalalian::forge((int) $session->last_activity)->ago(),
                          ];
                      });

        return Inertia::render('Profile/Sessions', [
            'sessions' => $sessions
        ]);
    }

    public function logoutSession($id)
    {
        DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', auth()->id())
            ->delete();

        return back()->with('message', 'خروج از دستگاه با موفقیت انجام شد.');
    }

    public function logoutOtherSessions(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        \Illuminate\Support\Facades\Auth::logoutOtherDevices($request->password);

        DB::table('sessions')
            ->where('user_id', auth()->id())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return back()->with('message', 'همه دستگاه‌های دیگر خارج شدند.');
    }
}
