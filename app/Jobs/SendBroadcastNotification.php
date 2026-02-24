<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\NotificationBroadcast;
use App\Models\SmsLog;
use App\Notifications\SystemNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendBroadcastNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour timeout for large batches
    protected $broadcast;

    public function __construct(NotificationBroadcast $broadcast)
    {
        $this->broadcast = $broadcast;
    }

    public function handle(): void
    {
        $query = User::active();

        if ($this->broadcast->target_type === 'club') {
            $query->where('club_id', $this->broadcast->target_id);
        } elseif ($this->broadcast->target_type === 'manual') {
            $query->whereIn('id', $this->broadcast->recipient_ids ?? []);
        }

        // Process in chunks to manage memory
        $query->chunk(100, function ($users) {
            foreach ($this->broadcast->channels as $channel) {
                if ($channel === 'database') {
                    Notification::send($users, new SystemNotification($this->broadcast->title, $this->broadcast->message));
                } elseif ($channel === 'sms') {
                    foreach ($users as $user) {
                        if ($user->mobile) {
                            SmsLog::logSms([
                                'user_id' => $user->id,
                                'mobile' => $user->mobile,
                                'message' => $this->broadcast->message,
                                'status' => 'sent', // Initially sent to provider
                                'sms_type' => 'bulk_notification'
                            ]);
                            // Real SMS sending logic via Provider Service would go here
                        }
                    }
                } elseif ($channel === 'email') {
                    foreach ($users as $user) {
                        if ($user->email) {
                            try {
                                $subject = $this->broadcast->title;
                                $content = $this->broadcast->message;

                                if ($this->broadcast->email_theme_id) {
                                    $theme = \App\Models\EmailTheme::find($this->broadcast->email_theme_id);
                                    if ($theme) {
                                        $content = str_replace('{content}', $content, $theme->content);
                                        // Add other variable replacements if needed
                                        $content = str_replace('{name}', $user->first_name ?? 'کاربر', $content);
                                    }
                                }

                                // Retrieve email settings
                                $settings = \App\Models\SystemSetting::getAllGroupSettings('email');

                                // Configure mailer dynamically
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

                                // Force purge to reload config
                                \Illuminate\Support\Facades\Mail::purge('smtp');

                                $fromAddress = config('mail.from.address');
                                $fromName = config('mail.from.name');

                                \Illuminate\Support\Facades\Mail::html($content, function ($message) use ($user, $subject, $fromAddress, $fromName) {
                                    $message->to($user->email)
                                            ->subject($subject)
                                            ->from($fromAddress, $fromName);
                                });

                                \App\Models\EmailLog::logEmail([
                                    'user_id' => $user->id,
                                    'email' => $user->email,
                                    'subject' => $subject,
                                    'content' => $content,
                                    'status' => 'sent'
                                ]);
                            } catch (\Exception $e) {
                                \Illuminate\Support\Facades\Log::error("Broadcast Email Failed for user {$user->id}: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
        });
    }
}
