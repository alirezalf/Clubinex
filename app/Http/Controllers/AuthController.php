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
        return Inertia::render('Auth/Login');
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
        $result = $this->otpService->sendOtp($request->mobile);

        if ($result['success']) {
            return response()->json([
                'message' => 'کد تایید ارسال شد',
                'step' => 'verify',
                'mobile' => $request->mobile,
                'dev_code' => app()->isLocal() ? $result['dev_code'] : null
            ]);
        }

        return response()->json(['message' => 'خطا در ارسال پیامک'], 500);
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
            ActivityLog::log('user.logout', 'خروج از حساب', ['user_id' => Auth::id()]);
        }
        
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    // متد ثبت نام مستقل (ریفکتور شده)
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'status_id' => 1, // Active
        ]);
        
        $user->assignRole('user');

        Auth::login($user);
        
        session(['locked' => false]);
        session(['last_activity_time' => now()->timestamp]);

        ActivityLog::log('user.register', 'ثبت نام کاربر جدید', ['user_id' => $user->id]);

        return redirect()->route('dashboard');
    }
}
