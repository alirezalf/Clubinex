<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\User;
use App\Services\SMS\SmsManager;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OtpService
{
    protected $smsManager;

    public function __construct(SmsManager $smsManager)
    {
        $this->smsManager = $smsManager;
    }

    /**
     * ارسال کد تایید
     */
    public function sendOtp(string $mobile): array
    {
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

        // 1. یافتن یا ساخت کاربر
        $user = User::firstOrCreate(
            ['mobile' => $mobile],
            [
                'status_id' => 1,
            ]
        );

        // 2. تولید کد
        $otpCode = $user->sendNewOtp();

        // 3. ارسال از طریق سرویس SMS
        try {
            // استفاده از درایور مناسب (smsir یا ...)
            $sent = $this->smsManager->driver()->sendVerify($mobile, (string)$otpCode);
            Log::info('OTP SEND RESULT', [
                'mobile' => $mobile,
                'code' => $otpCode,
                'sent' => $sent ? 'true' : 'false',
                'provider' => SystemSetting::getValue('sms', 'sms_provider', 'smsir')
            ]);
            if ($sent) {
                // تنظیم کش برای جلوگیری از ارسال مجدد سریع
                Cache::put($throttleKey, now()->addSeconds($resendInterval)->timestamp, $resendInterval);

                return [
                    'success' => true,
                    'message' => 'کد تایید ارسال شد.',
                    'dev_code' => app()->isLocal() ? $otpCode : null,
                    'resend_interval' => $resendInterval
                ];
            } else {
                \Illuminate\Support\Facades\Log::error('OTP Service: Failed to send SMS', ['mobile' => $mobile]);
                return ['success' => false, 'message' => 'خطا در ارسال پیامک.'];
            }
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('OTP Service Exception', ['error' => $e->getMessage()]);
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
            // Check if user has received initial registration points
            $hasRegistrationPoints = \App\Models\PointTransaction::where('user_id', $user->id)
                ->whereHas('rule', function ($q) {
                    $q->where('action_code', 'initial_registration');
                })->exists();

            if (!$hasRegistrationPoints) {
                $rule = \App\Models\PointRule::firstOrCreate(
                    ['action_code' => 'initial_registration'],
                    [
                        'title' => 'امتیاز ثبت نام اولیه',
                        'points' => 10, // Default points
                        'type' => 'one_time',
                        'is_active' => true,
                        'description' => 'امتیازی که کاربر هنگام اولین ثبت نام و ورود به سیستم دریافت می‌کند.'
                    ]
                );

                if ($rule && $rule->is_active && $rule->points > 0) {
                    $rule->applyToUser($user->id, [], 'امتیاز ثبت نام اولیه');
                }
            }

            return $user;
        }

        return null;
    }
}
