<?php

namespace App\Jobs;

use App\Models\SmsLog;
use App\Services\SMS\SmsManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $mobile;
    protected $message;
    protected $userId;
    protected $templateId;
    protected $parameters;

    /**
     * تعداد تلاش مجدد در صورت خطا
     */
    public $tries = 3;

    public function __construct($mobile, $message, $userId = null, $templateId = null, $parameters = [])
    {
        $this->mobile = $mobile;
        $this->message = $message;
        $this->userId = $userId;
        $this->templateId = $templateId;
        $this->parameters = $parameters;
    }

    public function handle(SmsManager $smsManager): void
    {
        $provider = \App\Models\SystemSetting::getValue('sms', 'sms_provider', 'smsir');
        $provider = strtolower(trim($provider, '/'));

        // ثبت لاگ اولیه
        $log = SmsLog::logSms([
            'user_id' => $this->userId,
            'mobile' => $this->mobile,
            'message' => $this->message,
            'status' => 'pending',
            'provider' => $provider,
            'sms_type' => $this->templateId ? 'verify' : 'notification'
        ]);

        try {
            $driver = $smsManager->driver($provider);

            // اعتبارسنجی درایور
            if (!$driver) {
                throw new \Exception("SMS Driver not found: {$provider}");
            }

            // بررسی اعتبار حساب قبل از ارسال
            $credit = $driver->getCredit();
            if ($credit === null) {
                Log::warning('SMS: Could not retrieve credit', ['provider' => $provider]);
            }

            $success = false;

            if ($this->templateId) {
                // ارسال پیام تأیید
                if (!empty($this->parameters)) {
                    $formattedParams = [];
                    foreach ($this->parameters as $key => $value) {
                        $formattedParams[] = [
                            'name' => $key,
                            'value' => (string)$value
                        ];
                    }
                    $success = $driver->sendVerifyWithParams(
                        $this->mobile,
                        (int)$this->templateId,
                        $formattedParams
                    );
                } else {
                    $success = $driver->sendVerify(
                        $this->mobile,
                        $this->message,
                        $this->templateId
                    );
                }
            } else {
                // ارسال پیام عادی
                $success = $driver->sendBulk($this->mobile, $this->message);
            }

            if ($success) {
                $log->updateStatus('sent', [
                    'cost' => 0,
                    'provider_response' => 'Success'
                ]);

                Log::info('SMS sent successfully', [
                    'mobile' => $this->mobile,
                    'type' => $this->templateId ? 'verify' : 'bulk'
                ]);
            } else {
                throw new \Exception('SMS Provider returned false');
            }
        } catch (\Exception $e) {
            // ثبت خطا
            $log->updateStatus('failed', [
                'error_message' => $e->getMessage(),
                'provider' => $provider
            ]);

            Log::error('SMS sending failed', [
                'mobile' => $this->mobile,
                'error' => $e->getMessage(),
                'provider' => $provider
            ]);

            // اگر تعداد تلاش‌ها کمتر از حداکثر است، دوباره تلاش کن
            if ($this->attempts() < $this->tries) {
                $this->release(30); // 30 ثانیه بعد دوباره تلاش کن
            } else {
                throw $e;
            }
        }
    }

    /**
     * تعداد ثانیه‌های تاخیر بین تلاش‌های مجدد
     */
    public function backoff(): array
    {
        return [5, 10, 30]; // 5, 10, 30 ثانیه تاخیر بین تلاش‌ها
    }
}
