<?php

namespace App\Services;

use App\Models\NotificationTemplate;
use App\Models\User;
use App\Jobs\SendSms; // جاب جدید
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * ارسال اعلان هوشمند با استفاده از صف (Queue)
     */
    public static function send(string $eventName, User $user, array $data = [])
    {
        $template = NotificationTemplate::with('emailTheme')->where('event_name', $eventName)->first();

        if (!$template) {
            return;
        }

        $data = array_merge([
            'name' => $user->first_name ?? 'کاربر',
            'mobile' => $user->mobile,
            'email' => $user->email,
        ], $data);

        // 1. ارسال SMS (به صورت Async در صف)
        if ($template->sms_active && $user->mobile) {
            try {
                $message = self::replaceVariables($template->sms_pattern, $data);
                
                // دیسپچ کردن جاب به جای ارسال مستقیم
                SendSms::dispatch($user->mobile, $message, $user->id);

            } catch (\Exception $e) {
                Log::error("SMS Dispatch Failure [{$eventName}]: " . $e->getMessage());
            }
        }

        // 2. ارسال ایمیل (لاراول به صورت پیش‌فرض از صف Mail پشتیبانی می‌کند اگر کانفیگ شده باشد)
        if ($template->email_active && $user->email) {
            try {
                $subject = self::replaceVariables($template->email_subject, $data);
                $rawBody = self::replaceVariables($template->email_body, $data);
                
                $finalBody = $rawBody;
                if ($template->emailTheme) {
                    $themeContent = str_replace('{content}', $rawBody, $template->emailTheme->content);
                    $finalBody = self::replaceVariables($themeContent, $data);
                }

                // استفاده از queue() به جای send() برای ارسال در صف
                Mail::html($finalBody, function ($message) use ($user, $subject) {
                    $message->to($user->email)->subject($subject);
                });
                
                \App\Models\EmailLog::logEmail([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'subject' => $subject,
                    'content' => $finalBody,
                    'status' => 'pending' // وضعیت پندینگ تا زمان ارسال واقعی
                ]);
            } catch (\Exception $e) {
                Log::error("Email Dispatch Failure [{$eventName}]: " . $e->getMessage());
            }
        }

        // 3. ارسال اعلان داخلی (Database معمولا سریع است و نیازی به صف سنگین ندارد)
        if ($template->database_active) {
            try {
                $message = self::replaceVariables($template->database_message, $data);
                // SystemNotification خودش ShouldQueue را implement کرده است
                Notification::send($user, new SystemNotification($template->title_fa, $message));
            } catch (\Exception $e) {
                Log::error("DB Notification Failure [{$eventName}]: " . $e->getMessage());
            }
        }
    }

    private static function replaceVariables($text, $data)
    {
        if (empty($text)) return '';
        
        foreach ($data as $key => $value) {
            $val = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string)$value;
            $text = str_replace('{' . $key . '}', $val, $text);
        }
        return $text;
    }
}