<?php

namespace App\Services;

use App\Models\User;
use App\Services\SMS\SmsManager;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Exception;

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
