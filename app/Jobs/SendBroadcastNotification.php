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
                }
                // Email logic can be added here
            }
        });
    }
}