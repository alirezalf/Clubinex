<?php

namespace App\Jobs;

use App\Models\SmsLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $mobile;
    protected $message;
    protected $userId;

    /**
     * تعداد تلاش مجدد در صورت خطا
     */
    public $tries = 3;

    public function __construct($mobile, $message, $userId = null)
    {
        $this->mobile = $mobile;
        $this->message = $message;
        $this->userId = $userId;
    }

    public function handle(): void
    {
        // دریافت تنظیمات از دیتابیس یا کش
        $settings = cache()->remember('global_settings', 3600, function () {
            return \App\Models\SystemSetting::getSettingsArray();
        });

        $provider = $settings['sms.sms_provider'] ?? 'kavenegar';
        $apiKey = $settings['sms.sms_api_key'] ?? '';
        $sender = $settings['sms.sms_sender'] ?? '';

        // ثبت لاگ اولیه (در حال ارسال)
        $log = SmsLog::logSms([
            'user_id' => $this->userId,
            'mobile' => $this->mobile,
            'message' => $this->message,
            'status' => 'pending',
            'provider' => $provider,
            'sms_type' => 'notification'
        ]);

        try {
            // شبیه‌سازی ارسال (در پروژه واقعی اینجا به API درگاه وصل می‌شوید)
            // مثلا برای کاوه نگار:
            // $api = new \Kavenegar\KavenegarApi($apiKey);
            // $api->Send($sender, $this->mobile, $this->message);
            
            // فعلا فقط لاگ می‌گیریم
            Log::info("SMS Sent to {$this->mobile}: {$this->message}");
            
            // آپدیت وضعیت به ارسال شده
            $log->updateStatus('sent', ['cost' => 500]); // هزینه فرضی

        } catch (\Exception $e) {
            $log->updateStatus('failed', ['error_message' => $e->getMessage()]);
            Log::error("SMS Job Failed: " . $e->getMessage());
            
            // پرتاب خطا برای تلاش مجدد توسط صف لاراول
            throw $e;
        }
    }
}