<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserStatus extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'name',        // نام وضعیت (فارسی)
        'slug',        // نامک یکتا (انگلیسی)
        'color',       // رنگ نمایش در داشبورد
        'is_active',   // فعال بودن وضعیت
        'order',       // ترتیب نمایش در لیست‌ها
        'description', // توضیحات وضعیت
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'is_active' => 'boolean', // تبدیل به بولین
    ];

    // ==================== روابط ====================

    /**
     * رابطه یک به چند با کاربران
     * هر وضعیت می‌تواند متعلق به چندین کاربر باشد
     */
    public function users()
    {
        return $this->hasMany(User::class, 'status_id');
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای دریافت وضعیت‌های فعال
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * اسکوپ برای مرتب‌سازی بر اساس ترتیب
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * اسکوپ برای وضعیت‌های قابل استفاده در dropdown
     */
    public function scopeForDropdown($query)
    {
        return $query->active()->ordered()->pluck('name', 'id');
    }

    // ==================== توابع کمکی ====================

    /**
     * دریافت کلاس CSS برای رنگ وضعیت
     * @return string کلاس CSS
     */
    public function getColorClassAttribute()
    {
        return "status-{$this->slug}";
    }

    /**
     * بررسی آیا وضعیت قابل حذف است یا نه
     * وضعیت قابل حذف نیست اگر کاربرانی داشته باشد
     * @return bool
     */
    public function isDeletable()
    {
        return $this->users()->count() === 0;
    }

    /**
     * دریافت لیست کاربران با این وضعیت (برای گزارش)
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUsersList()
    {
        return $this->users()->with('club')->get();
    }
}