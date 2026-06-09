<?php

namespace App\Services;

use App\Models\User;
use App\Services\SMS\SmsManager;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Exception;
use Illuminate\Http\Request;

class OtpService
{
    protected $smsManager;
    protected $request;

    public function __construct(SmsManager $smsManager, Request $request)
    {
        $this->smsManager = $smsManager;
        $this->request = $request;
    }

    /**
     * ارسال کد تایید
     */
    public function sendOtp(string $mobile, ?string $referralCode = null): array
    {
        // Rate limiting: Max 3 per hour per IP+Mobile combo
        $rateLimitKey = 'send-otp:' . $mobile . ':' . $this->request->ip();

        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return [
                'success' => false,
                'message' => "بیش از حد مجاز تلاش کرده‌اید. لطفا مجددا پس از {$seconds} ثانیه تلاش کنید.",
                'remaining' => $seconds
            ];
        }

        // 0. بررسی محدودیت ارسال (Throttling)
        $resendInterval = (int) SystemSetting::getValue('sms', 'resend_interval', 120);
        $throttleKey = 'otp_throttle_' . $mobile;

        if (Cache::has($throttleKey)) {
            $remaining = Cache::get($throttleKey) - now()->timestamp;
            if ($remaining > 0) {
                return [
                    'success' => false,
                    'message' => "لطفا {$remaining} ثانیه صبر کنید.",
                    'remaining' => $remaining
                ];
            }
        }

        // بررسی کد معرف در صورت وجود
        $referredById = null;
        if (!empty($referralCode)) {
            // تبدیل اعداد فارسی به انگلیسی و حروف به بزرگ
            $referralCode = strtr($referralCode, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9', '١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9','٠'=>'0']);
            $referralCodeUpperCase = strtoupper(trim($referralCode));

            $referrer = User::where('referral_code', $referralCodeUpperCase)
                ->orWhere('mobile', $referralCode) // موبایل معمولا بزرگ و کوچک ندارد
                ->first();

            if ($referrer) {
                $referredById = $referrer->id;
            }
        }

        // 1. یافتن یا ساخت کاربر
        $user = User::firstOrCreate(
            ['mobile' => $mobile],
            [
                'status_id' => 1,
                'referred_by' => $referredById,
                'referral_code' => strtoupper(substr(md5($mobile . time()), 0, 8)),
            ]
        );

        if ($user->wasRecentlyCreated) {
            $defaultRole = \App\Models\SystemSetting::getValue('security', 'default_role', 'user');
            $user->assignRole($defaultRole);
            if ($referredById && $referredById !== $user->id) {
                \App\Models\ReferralNetwork::createReferral($referredById, $user->id);
            }
        }

        // 2. تولید کد
        $otpCode = $user->sendNewOtp();

        // 3. ارسال از طریق سرویس SMS
        try {
            // استفاده از درایور مناسب (smsir یا ...)
            $sent = $this->smsManager->driver()->sendVerify($mobile, (string)$otpCode);

            if ($sent) {
                // تنظیم کش برای جلوگیری از ارسال مجدد سریع
                Cache::put($throttleKey, now()->addSeconds($resendInterval)->timestamp, $resendInterval);

                // ثبت در Rate Limiter برای محدودیت ساعتی (۳ بار در ساعت)
                RateLimiter::hit($rateLimitKey, 3600);

                return [
                    'success' => true,
                    'message' => 'کد تایید ارسال شد.',
                    'dev_code' => app()->isLocal() ? $otpCode : null,
                    'resend_interval' => $resendInterval
                ];
            } else {
                return ['success' => false, 'message' => 'خطا در ارسال پیامک.'];
            }

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطا در ارسال پیامک: ' . $e->getMessage()];
        }
    }

    /**
     * تایید کد
     */
    public function verify(string $mobile, string $code): ?User
    {
        $user = User::where('mobile', $mobile)->first();

        if (!$user) {
            return null;
        }

        if ($user->verifyOtp($code)) {
            return $user;
        }

        return null;
    }
}
