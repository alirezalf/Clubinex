<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;

class SystemNotification extends Notification implements ShouldQueue
{
    use Queueable;

    // تنظیمات مهم برای جلوگیری از لوپ بی‌نهایت
    public $tries = 3; // حداکثر ۳ بار تلاش
    public $timeout = 10; // ۱۰ ثانیه مهلت اجرا
    public $backoff = 5; // ۵ ثانیه صبر بین تلاش‌ها

    protected $title;
    protected $message;

    public function __construct($title, $message)
    {
        $this->title = $title;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'icon' => 'bell',
            'link' => null,
            // استفاده از ترای/کچ برای جلوگیری از شکستن جاب به خاطر فرمت تاریخ
            'created_at_jalali' => now()->format('Y/m/d H:i') 
        ];
    }
}