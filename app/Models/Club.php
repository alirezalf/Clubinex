<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Club extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'name',              // نام باشگاه (برنزی، نقره‌ای، ...)
        'slug',              // نامک یکتا برای URL
        'is_tier',           // آیا این یک سطح اصلی است؟ (لول بندی)
        'icon',              // آیکون باشگاه
        'image',             // تصویر باشگاه
        'min_points',        // حداقل امتیاز برای رسیدن به این سطح (برای سطوح اصلی)
        'max_points',        // سقف امتیاز (نمایشی)
        'joining_cost',      // هزینه خرید/ارتقا به امتیاز
        'color',             // رنگ باشگاه
        'benefits',          // مزایای باشگاه (JSON)
        'is_active',         // فعال بودن باشگاه
        'upgrade_required',  // آیا ارتقا نیاز به تأیید دستی دارد؟
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'is_tier' => 'boolean',           // تبدیل به بولین
        'min_points' => 'integer',        // تبدیل به عدد صحیح
        'max_points' => 'integer',        // تبدیل به عدد صحیح
        'joining_cost' => 'integer',      // تبدیل به عدد صحیح
        'benefits' => 'array',            // تبدیل JSON به آرایه
        'is_active' => 'boolean',         // تبدیل به بولین
        'upgrade_required' => 'boolean',  // تبدیل به بولین
    ];

    // ==================== روابط ====================

    /**
     * رابطه یک به چند با کاربران (برای سطح اصلی)
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * رابطه چند به چند با اعضا (برای باشگاه‌های ویژه)
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'club_user')
                    ->withPivot('joined_at', 'is_active');
    }

    /**
     * رابطه یک به چند با درخواست‌های عضویت
     */
    public function clubRegistrations()
    {
        return $this->hasMany(ClubRegistration::class);
    }

    /**
     * رابطه یک به چند با نظرسنجی‌ها
     */
    public function surveys()
    {
        return $this->hasMany(Survey::class, 'required_club_id');
    }

    // ==================== اسکوپ‌ها ====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * اسکوپ برای دریافت سطوح اصلی (برنزی، نقره‌ای و...)
     */
    public function scopeTiers($query)
    {
        return $query->where('is_tier', true);
    }

    /**
     * اسکوپ برای دریافت باشگاه‌های ویژه (اتاق‌ها)
     */
    public function scopeSpecial($query)
    {
        return $query->where('is_tier', false);
    }

    public function scopeOrderByPoints($query)
    {
        return $query->orderBy('min_points');
    }

    // ==================== توابع کمکی ====================

    public function getBenefitsListAttribute()
    {
        return $this->benefits ?? [];
    }

    /**
     * دریافت سطح بعدی (فقط برای Tier ها)
     */
    public function getNextTier()
    {
        if (!$this->is_tier) return null;

        return self::tiers()
            ->active()
            ->where('min_points', '>', $this->min_points)
            ->orderBy('min_points')
            ->first();
    }

    public function getColorClassAttribute()
    {
        return "club-{$this->slug}";
    }

    public function getMembersCountAttribute()
    {
        if ($this->is_tier) {
            return $this->users()->count();
        }
        return $this->members()->count();
    }
}