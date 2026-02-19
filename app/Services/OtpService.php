<?php

namespace App\Services;

use App\Models\User;
use App\Services\NotificationService;
use Exception;

class OtpService
{
    /**
     * ارسال کد تایید
     */
    public function sendOtp(string $mobile): array
    {
        // 1. یافتن یا ساخت کاربر
        $user = User::firstOrCreate(
            ['mobile' => $mobile],
            [
                'status_id' => 1, 
            ]
        );

        // 2. تولید کد
        $otpCode = $user->sendNewOtp();

        // 3. ارسال از طریق سرویس مرکزی نوتیفیکیشن
        try {
            NotificationService::send('otp_login', $user, ['code' => $otpCode]);

            return ['success' => true, 'message' => 'کد تایید ارسال شد.', 'dev_code' => $otpCode];

        } catch (Exception $e) {
            return ['success' => false, 'message' => 'خطا در ارسال پیامک.'];
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
