<?php

namespace App\Models;

use App\Models\ActivityLog;
use Morilog\Jalali\Jalalian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmailLog extends Model
{
    use HasFactory;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',          // کاربر دریافت‌کننده
        'email',            // آدرس ایمیل مقصد
        'subject',          // موضوع ایمیل
        'content',          // محتوای ایمیل
        'attachments',      // فایل‌های پیوست
        'provider',         // سرویس‌دهنده ایمیل
        'message_id',       // شناسه ایمیل در سرویس‌دهنده
        'status',           // وضعیت ارسال
        'error_message',    // پیام خطا
        'provider_response', // پاسخ سرویس‌دهنده
        'sent_at',          // زمان ارسال
        'delivered_at',     // زمان تحویل
        'opened_at',        // زمان باز شدن
        'clicked_at',       // زمان کلیک روی لینک
        'ip_address',       // آی‌پی بازکننده
        'email_type',       // نوع ایمیل
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'attachments' => 'array',          // تبدیل JSON به آرایه
        'provider_response' => 'array',    // تبدیل JSON به آرایه
        'sent_at' => 'datetime',           // تبدیل به تاریخ
        'delivered_at' => 'datetime',      // تبدیل به تاریخ
        'opened_at' => 'datetime',         // تبدیل به تاریخ
        'clicked_at' => 'datetime',        // تبدیل به تاریخ
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با کاربر
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای ایمیل‌های ارسال شده
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * اسکوپ برای ایمیل‌های تحویل داده شده
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * اسکوپ برای ایمیل‌های باز شده
     */
    public function scopeOpened($query)
    {
        return $query->where('status', 'opened');
    }

    /**
     * اسکوپ برای ایمیل‌های کلیک شده
     */
    public function scopeClicked($query)
    {
        return $query->where('status', 'clicked');
    }

    /**
     * اسکوپ برای ایمیل‌های ناموفق
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * اسکوپ برای ایمیل‌های اطلاع‌رسانی
     */
    public function scopeNotification($query)
    {
        return $query->where('email_type', 'notification');
    }

    /**
     * اسکوپ برای ایمیل‌های خبرنامه
     */
    public function scopeNewsletter($query)
    {
        return $query->where('email_type', 'newsletter');
    }

    /**
     * اسکوپ برای ایمیل‌های ارسال شده در بازه زمانی
     */
    public function scopeSentBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('sent_at', [$startDate, $endDate]);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا ایمیل باز شده است
     * @return bool
     */
    public function isOpened()
    {
        return $this->status === 'opened' || !is_null($this->opened_at);
    }

    /**
     * بررسی آیا روی ایمیل کلیک شده است
     * @return bool
     */
    public function isClicked()
    {
        return $this->status === 'clicked' || !is_null($this->clicked_at);
    }

    /**
     * دریافت زمان ارسال به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getSentAtJalaliAttribute()
    {
        return $this->sent_at ? Jalalian::fromDateTime($this->sent_at)->format('Y/m/d H:i') : null;
    }

    /**
     * دریافت زمان باز شدن به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getOpenedAtJalaliAttribute()
    {
        return $this->opened_at ? Jalalian::fromDateTime($this->opened_at)->format('Y/m/d H:i') : null;
    }

    /**
     * محاسبه زمان باز شدن (تفاوت بین ارسال و باز شدن)
     * @return int|null زمان بر حسب ثانیه یا null
     */
    public function getOpenTimeAttribute()
    {
        if ($this->sent_at && $this->opened_at) {
            return $this->sent_at->diffInSeconds($this->opened_at);
        }
        return null;
    }

    /**
     * ثبت لاگ ایمیل جدید
     * @param array $data اطلاعات ایمیل
     * @return EmailLog
     */
    public static function logEmail($data)
    {
        $email = self::create(array_merge([
            'sent_at' => now(),
            'status' => 'pending',
        ], $data));

        ActivityLog::log(
            'email.sent',
            "ایمیل به آدرس {$email->email} ارسال شد",
            [
                'user_id' => $email->user_id,
                'model_type' => self::class,
                'model_id' => $email->id,
            ]
        );

        return $email;
    }

    /**
     * بروزرسانی وضعیت ایمیل به "باز شده"
     * @param string|null $ipAddress آی‌پی بازکننده
     * @return bool
     */
    public function markAsOpened($ipAddress = null)
    {
        $result = $this->update([
            'status' => 'opened',
            'opened_at' => now(),
            'ip_address' => $ipAddress,
        ]);

        if ($result) {
            ActivityLog::log(
                'email.opened',
                "ایمیل به آدرس {$this->email} باز شد",
                [
                    'user_id' => $this->user_id,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['status' => $this->getOriginal('status')],
                    'new_values' => ['status' => 'opened'],
                ]
            );
        }

        return $result;
    }

    /**
     * بروزرسانی وضعیت ایمیل به "کلیک شده"
     * @return bool
     */
    public function markAsClicked()
    {
        $result = $this->update([
            'status' => 'clicked',
            'clicked_at' => now(),
        ]);

        if ($result) {
            ActivityLog::log(
                'email.clicked',
                "روی لینک ایمیل به آدرس {$this->email} کلیک شد",
                [
                    'user_id' => $this->user_id,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['status' => $this->getOriginal('status')],
                    'new_values' => ['status' => 'clicked'],
                ]
            );
        }

        return $result;
    }

    /**
     * دریافت لیست فایل‌های پیوست
     * @return array لیست فایل‌ها
     */
    public function getAttachmentsListAttribute()
    {
        return $this->attachments ?? [];
    }

    /**
     * بررسی آیا ایمیل پیوست دارد
     * @return bool
     */
    public function hasAttachments()
    {
        return !empty($this->attachments);
    }

    /**
     * محاسبه نرخ باز شدن (Open Rate) برای نوع خاصی از ایمیل
     * @param string $type نوع ایمیل
     * @param string|null $period دوره زمانی
     * @return float نرخ باز شدن به درصد
     */
    public static function calculateOpenRate($type = null, $period = null)
    {
        $query = self::query();

        if ($type) {
            $query->where('email_type', $type);
        }

        if ($period === 'month') {
            $query->whereMonth('sent_at', now()->month);
        } elseif ($period === 'year') {
            $query->whereYear('sent_at', now()->year);
        }

        $total = $query->count();
        $opened = $query->whereNotNull('opened_at')->count();

        if ($total == 0) {
            return 0;
        }

        return round(($opened / $total) * 100, 2);
    }

    /**
     * محاسبه نرخ کلیک (Click Rate) برای نوع خاصی از ایمیل
     * @param string $type نوع ایمیل
     * @param string|null $period دوره زمانی
     * @return float نرخ کلیک به درصد
     */
    public static function calculateClickRate($type = null, $period = null)
    {
        $query = self::query();

        if ($type) {
            $query->where('email_type', $type);
        }

        if ($period === 'month') {
            $query->whereMonth('sent_at', now()->month);
        } elseif ($period === 'year') {
            $query->whereYear('sent_at', now()->year);
        }

        $total = $query->count();
        $clicked = $query->whereNotNull('clicked_at')->count();

        if ($total == 0) {
            return 0;
        }

        return round(($clicked / $total) * 100, 2);
    }
}