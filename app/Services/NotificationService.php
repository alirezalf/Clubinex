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
        $template = NotificationTemplate::with(['emailTheme', 'smsTemplate'])->where('event_name', $eventName)->first();

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
                $templateId = null;
                $parameters = [];
                $message = '';

                $provider = \App\Models\SystemSetting::getValue('sms', 'sms_provider');

                // Priority 1: Use Linked SMS Template
                if ($template->smsTemplate) {
                    if (($provider === 'smsir' || $provider === 'sms.ir') && !empty($template->smsTemplate->provider_template_id)) {
                        $templateId = $template->smsTemplate->provider_template_id;
                        $parameters = $data;
                        $message = "Template ID: $templateId (Linked)";
                    } else {
                        // For other providers or if provider_template_id is missing, use content
                        $message = self::replaceVariables($template->smsTemplate->content, $data);
                    }
                }
                // Priority 2: Use Legacy Pattern (if numeric and sms.ir)
                elseif (($provider === 'smsir' || $provider === 'sms.ir') && is_numeric($template->sms_pattern)) {
                    $templateId = $template->sms_pattern;
                    $parameters = $data;
                    $message = "Template ID: $templateId (Legacy)";
                }
                // Priority 3: Use Legacy Pattern (Text)
                else {
                    $message = self::replaceVariables($template->sms_pattern, $data);
                }

                // دیسپچ کردن جاب به جای ارسال مستقیم
                SendSms::dispatch($user->mobile, $message, $user->id, $templateId, $parameters);

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
                $settings = \App\Models\SystemSetting::getAllGroupSettings('email');

                config([
                    'mail.default' => 'smtp',
                    'mail.mailers.smtp.transport' => 'smtp',
                    'mail.mailers.smtp.host' => $settings['mail_host'] ?? $settings['host'] ?? config('mail.mailers.smtp.host'),
                    'mail.mailers.smtp.port' => $settings['mail_port'] ?? $settings['port'] ?? config('mail.mailers.smtp.port'),
                    'mail.mailers.smtp.encryption' => (int)($settings['mail_port'] ?? $settings['port'] ?? 587) === 465 ? 'ssl' : 'tls',
                    'mail.mailers.smtp.username' => $settings['mail_username'] ?? $settings['username'] ?? config('mail.mailers.smtp.username'),
                    'mail.mailers.smtp.password' => $settings['mail_password'] ?? $settings['password'] ?? config('mail.mailers.smtp.password'),
                    'mail.from.address' => $settings['from_address'] ?? $settings['mail_from_address'] ?? config('mail.from.address'),
                    'mail.from.name' => $settings['from_name'] ?? $settings['mail_from_name'] ?? config('mail.from.name'),
                ]);

                \Illuminate\Support\Facades\Mail::purge('smtp');

                $fromAddress = config('mail.from.address');
                $fromName = config('mail.from.name');

                Mail::html($finalBody, function ($message) use ($user, $subject, $fromAddress, $fromName) {
                    $message->to($user->email)
                            ->subject($subject)
                            ->from($fromAddress, $fromName);
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
