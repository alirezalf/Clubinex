<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OtpService;
use App\Models\ActivityLog;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function showLogin()
    {
        // Fetch all settings flattened by key
        $settings = \Illuminate\Support\Facades\Cache::remember('global_settings_array', 3600, function () {
            return \App\Models\SystemSetting::all()->pluck('value', 'key')->toArray();
        });

        $captchaEnabled = filter_var($settings['captcha_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $captchaUrl = $captchaEnabled ? captcha_src('flat') : null;

        return Inertia::render('Auth/Login', [
            'captchaUrl' => $captchaUrl,
            'settings' => $settings
        ]);
    }

    // ورود با ایمیل و پسورد (ریفکتور شده)
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            session(['locked' => false]);
            session(['last_activity_time' => now()->timestamp]);

            ActivityLog::log('user.login', 'ورود موفق با ایمیل', ['user_id' => Auth::id()]);

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'اطلاعات ورود صحیح نمی‌باشد.',
        ]);
    }

    // مرحله 1: درخواست OTP (ریفکتور شده)
    public function sendOtp(SendOtpRequest $request)
    {
        $result = $this->otpService->sendOtp($request->mobile, $request->referral_code);

        if ($result['success']) {
            return response()->json([
                'message' => 'کد تایید ارسال شد',
                'step' => 'verify',
                'mobile' => $request->mobile,
                'dev_code' => $result['dev_code'] ?? null,
                'resend_interval' => $result['resend_interval'] ?? 120
            ]);
        }

        // Check if it's a throttle error
        if (isset($result['remaining'])) {
            return response()->json(['message' => $result['message'], 'remaining' => $result['remaining']], 429);
        }

        return response()->json(['message' => $result['message']], 500);
    }

    // مرحله 2: تایید OTP و لاگین (ریفکتور شده)
    public function verifyOtp(VerifyOtpRequest $request)
    {
        $user = $this->otpService->verify($request->mobile, $request->code);

        if ($user) {
            Auth::login($user, true);
            $request->session()->regenerate();

            session(['locked' => false]);
            session(['last_activity_time' => now()->timestamp]);

            ActivityLog::log('user.login', 'ورود با موبایل (OTP)', ['user_id' => $user->id]);

            return redirect()->intended('dashboard');
        }

        return back()->withErrors(['code' => 'کد وارد شده صحیح نیست یا منقضی شده است.']);
    }

    public function logout(Request $request)
    {
        if (Auth::check()) {
            ActivityLog::log('user.logout', 'خروج', ['user_id' => Auth::id()]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Inertia::location('/login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    // متد ثبت نام مستقل (ریفکتور شده)
    public function register(RegisterRequest $request)
    {
        $referredById = null;
        if ($request->referral_code) {
            $referralCode = strtr($request->referral_code, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9', '١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9','٠'=>'0']);
            $referralCodeUpperCase = strtoupper(trim($referralCode));

            $referrer = User::where('referral_code', $referralCodeUpperCase)
                ->orWhere('mobile', $referralCode)
                ->first();

            if ($referrer) {
                $referredById = $referrer->id;
            }
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'status_id' => 1, // Active
            'referred_by' => $referredById,
            'referral_code' => strtoupper(substr(md5($request->mobile . time()), 0, 8)),
        ]);

        $defaultRole = \App\Models\SystemSetting::getValue('security', 'default_role', 'user');
        $user->assignRole($defaultRole);

        if ($referredById && $referredById !== $user->id) {
            \App\Models\ReferralNetwork::createReferral($referredById, $user->id);
        }

        Auth::login($user);

        session(['locked' => false]);
        session(['last_activity_time' => now()->timestamp]);

        ActivityLog::log('user.register', 'ثبت نام کاربر جدید', ['user_id' => $user->id]);

        return redirect()->route('dashboard');
    }
}
