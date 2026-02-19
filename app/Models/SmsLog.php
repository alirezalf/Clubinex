<?php

namespace App\Models;

use Morilog\Jalali\Jalalian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SmsLog extends Model
{
    use HasFactory;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',          // کاربر دریافت‌کننده
        'mobile',           // شماره موبایل مقصد
        'message',          // متن پیامک
        'provider',         // سرویس‌دهنده SMS
        'message_id',       // شناسه پیام در سرویس‌دهنده
        'status',           // وضعیت ارسال
        'error_message',    // پیام خطا
        'provider_response', // پاسخ سرویس‌دهنده
        'cost',             // هزینه ارسال (ریال)
        'ip_address',       // آی‌پی درخواست‌دهنده
        'sms_type',         // نوع SMS
        'sent_at',          // زمان ارسال
        'delivered_at',     // زمان تحویل
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'provider_response' => 'array',  // تبدیل JSON به آرایه
        'cost' => 'integer',             // تبدیل به عدد صحیح
        'sent_at' => 'datetime',         // تبدیل به تاریخ
        'delivered_at' => 'datetime',    // تبدیل به تاریخ
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
     * اسکوپ برای SMS‌های ارسال شده
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * اسکوپ برای SMS‌های تحویل داده شده
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * اسکوپ برای SMS‌های ناموفق
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * اسکوپ برای SMS‌های OTP
     */
    public function scopeOtp($query)
    {
        return $query->where('sms_type', 'otp');
    }

    /**
     * اسکوپ برای SMS‌های اطلاع‌رسانی
     */
    public function scopeNotification($query)
    {
        return $query->where('sms_type', 'notification');
    }

    /**
     * اسکوپ برای SMS‌های ارسال شده در بازه زمانی
     * @param string $startDate تاریخ شروع
     * @param string $endDate تاریخ پایان
     */
    public function scopeSentBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('sent_at', [$startDate, $endDate]);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا SMS ارسال شده است
     * @return bool
     */
    public function isSent()
    {
        return $this->status === 'sent';
    }

    /**
     * بررسی آیا SMS تحویل داده شده است
     * @return bool
     */
    public function isDelivered()
    {
        return $this->status === 'delivered';
    }

    /**
     * بررسی آیا SMS ناموفق بوده است
     * @return bool
     */
    public function isFailed()
    {
        return $this->status === 'failed';
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
     * دریافت زمان تحویل به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getDeliveredAtJalaliAttribute()
    {
        return $this->delivered_at ? Jalalian::fromDateTime($this->delivered_at)->format('Y/m/d H:i') : null;
    }

    /**
     * محاسبه زمان تحویل (تفاوت بین ارسال و تحویل)
     * @return int|null زمان بر حسب ثانیه یا null
     */
    public function getDeliveryTimeAttribute()
    {
        if ($this->sent_at && $this->delivered_at) {
            return $this->sent_at->diffInSeconds($this->delivered_at);
        }
        return null;
    }

    /**
     * ثبت لاگ SMS جدید
     * @param array $data اطلاعات SMS
     * @return SmsLog
     */
    public static function logSms($data)
    {
        $sms = self::create(array_merge([
            'sent_at' => now(),
            'status' => 'pending',
        ], $data));

        // ثبت لاگ فعالیت
        ActivityLog::log(
            'sms.sent',
            "SMS به شماره {$sms->mobile} ارسال شد",
            [
                'user_id' => $sms->user_id,
                'model_type' => self::class,
                'model_id' => $sms->id,
            ]
        );

        return $sms;
    }

    /**
     * بروزرسانی وضعیت SMS
     * @param string $status وضعیت جدید
     * @param array $additionalData اطلاعات اضافی
     * @return bool
     */
    public function updateStatus($status, $additionalData = [])
    {
        $updateData = array_merge(['status' => $status], $additionalData);

        if ($status === 'delivered' && !$this->delivered_at) {
            $updateData['delivered_at'] = now();
        }

        $result = $this->update($updateData);

        if ($result) {
            ActivityLog::log(
                "sms.{$status}",
                "SMS به شماره {$this->mobile} با وضعیت {$status} بروزرسانی شد",
                [
                    'user_id' => $this->user_id,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['status' => $this->getOriginal('status')],
                    'new_values' => ['status' => $status],
                ]
            );
        }

        return $result;
    }

    /**
     * دریافت متن کوتاه پیام (برای نمایش در لیست)
     * @param int $length طول متن
     * @return string متن کوتاه
     */
    public function getShortMessageAttribute($length = 50)
    {
        if (strlen($this->message) <= $length) {
            return $this->message;
        }
        return substr($this->message, 0, $length) . '...';
    }

    /**
     * محاسبه هزینه کل SMS‌ها برای کاربر
     * @param int $userId شناسه کاربر
     * @param string|null $period دوره زمانی (مثلاً 'month')
     * @return int هزینه کل
     */
    public static function getUserTotalCost($userId, $period = null)
    {
        $query = self::where('user_id', $userId)->whereNotNull('cost');

        if ($period === 'month') {
            $query->whereMonth('sent_at', now()->month);
        } elseif ($period === 'year') {
            $query->whereYear('sent_at', now()->year);
        }

        return $query->sum('cost');
    }
}