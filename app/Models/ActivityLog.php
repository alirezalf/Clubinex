<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class ActivityLog extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',          // کاربر انجام‌دهنده
        'admin_id',         // مدیر انجام‌دهنده
        'action',           // نوع فعالیت (مثلا: user.login)
        'action_group',     // گروه فعالیت (مثلا: user, point, system)
        'description',      // توضیح کامل فعالیت
        'model_type',       // نوع مدل مرتبط
        'model_id',         // شناسه مدل مرتبط
        'old_values',       // مقادیر قدیمی (برای ویرایش)
        'new_values',       // مقادیر جدید (برای ویرایش)
        'ip_address',       // آی‌پی انجام‌دهنده
        'user_agent',       // اطلاعات مرورگر
        'location',         // موقعیت جغرافیایی (اختیاری)
        'device_type',      // نوع دستگاه (web, mobile)
        'severity',         // سطح اهمیت (info, warning, error)
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // ==================== روابط ====================

    /**
     * رابطه با کاربر انجام دهنده
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * رابطه با ادمین (اگر توسط مدیر انجام شده باشد)
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * رابطه پلی‌مورفیک با مدل مرتبط
     */
    public function subject()
    {
        return $this->morphTo('model');
    }

    // ==================== متدها ====================

    /**
     * متد استاتیک برای ثبت سریع لاگ
     * 
     * @param string $action نام عملیات (با نقطه جدا شود، مثلا: point.earn)
     * @param string $description توضیحات فارسی
     * @param array $context آرایه اطلاعات تکمیلی (user_id, model, values, ...)
     * @return ActivityLog
     */
    public static function log($action, $description, $context = [])
    {
        $log = new self();
        $log->action = $action;
        $log->description = $description;
        
        // استخراج گروه از روی نام اکشن (مثلا user از user.login)
        $parts = explode('.', $action);
        $log->action_group = $parts[0] ?? 'system';

        // تنظیم کاربر
        $log->user_id = $context['user_id'] ?? auth()->id();
        $log->admin_id = $context['admin_id'] ?? null;
        
        // تنظیم مدل مرتبط
        $log->model_type = $context['model_type'] ?? null;
        $log->model_id = $context['model_id'] ?? null;
        
        // تنظیم مقادیر تغییر یافته
        $log->old_values = $context['old_values'] ?? null;
        $log->new_values = $context['new_values'] ?? null;
        
        // تنظیم سطح اهمیت
        $log->severity = $context['severity'] ?? 'info';
        
        // اطلاعات سیستمی
        $log->ip_address = request()->ip();
        $log->user_agent = request()->userAgent();
        
        // تشخیص ساده نوع دستگاه
        $ua = strtolower($log->user_agent ?? '');
        if (strpos($ua, 'mobile') !== false) {
            $log->device_type = 'mobile';
        } elseif (strpos($ua, 'tablet') !== false) {
            $log->device_type = 'tablet';
        } else {
            $log->device_type = 'web';
        }

        $log->save();

        return $log;
    }

    /**
     * دریافت تاریخ ایجاد به شمسی (استفاده شده در کنترلرها)
     */
    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }
}