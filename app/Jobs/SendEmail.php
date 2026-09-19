<?php

namespace App\Jobs;

use App\Models\EmailLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $to;
    protected $subject;
    protected $body;
    protected $fromAddress;
    protected $fromName;
    protected $mailConfig;
    protected $emailLogId;

    /**
     * تعداد تلاش مجدد در صورت خطا
     */
    public $tries = 3;

    public function __construct($to, $subject, $body, $fromAddress = null, $fromName = null, $mailConfig = [], $emailLogId = null)
    {
        $this->to = $to;
        $this->subject = $subject;
        $this->body = $body;
        $this->fromAddress = $fromAddress;
        $this->fromName = $fromName;
        $this->mailConfig = $mailConfig;
        $this->emailLogId = $emailLogId;
    }

    public function handle(): void
    {
        try {
            // اعمال پیکربندی SMTP اختصاصی تنظیمات سیستم (در صورت وجود)
            if (!empty($this->mailConfig) && is_array($this->mailConfig)) {
                config($this->mailConfig);
            }

            Mail::raw($this->body, function ($message) {
                $message->to($this->to)
                    ->subject($this->subject);

                if ($this->fromAddress) {
                    $message->from($this->fromAddress, $this->fromName ?? config('mail.from.name'));
                }
            });

            // بروزرسانی لاگ ایمیل در صورت وجود
            if ($this->emailLogId) {
                $log = EmailLog::find($this->emailLogId);
                if ($log) {
                    $log->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'message_id' => null,
                    ]);
                }
            }

            Log::info('Email sent successfully', ['to' => $this->to, 'subject' => $this->subject]);
        } catch (\Exception $e) {
            if ($this->emailLogId) {
                $log = EmailLog::find($this->emailLogId);
                if ($log) {
                    $log->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                }
            }

            Log::error('Email sending failed', [
                'to' => $this->to,
                'subject' => $this->subject,
                'error' => $e->getMessage(),
            ]);

            // اگر تعداد تلاش‌ها کمتر از حداکثر است، دوباره تلاش کن
            if ($this->attempts() < $this->tries) {
                $this->release(30);
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
