<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Schema;

class SystemSetting extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'group',        // گروه تنظیمات
        'key',          // کلید تنظیمات
        'value',        // مقدار تنظیمات
        'type',         // نوع مقدار
        'label',        // برچسب نمایشی
        'description',  // توضیحات
        'is_public',    // نمایش در پنل کاربری
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'is_public' => 'boolean',   // تبدیل به بولین
    ];

    /**
     * عملیات‌های مدل برای مدیریت کش
     */
    protected static function booted()
    {
        $clearCache = function () {
            try {
                if (Schema::hasTable('cache')) {
                     cache()->forget('global_settings');
                }
            } catch (\Exception $e) {
                // در هنگام اجرای سیدرها یا مایگریشن‌ها اگر کش در دسترس نبود، خطا ندهد
            }
        };

        static::saved($clearCache);
        static::deleted($clearCache);
        static::created($clearCache);
    }

    // ==================== Accessors & Mutators ====================

    /**
     * دریافت مقدار با توجه به نوع
     * اصلاح شده برای حل مشکل نمایش کاراکترهای یونیکد
     */
    public function getValueAttribute($value)
    {
        if (is_null($value)) {
            return null;
        }

        // اگر نوع داده ساختاریافته است، دیکد کن
        if ($this->type === 'array' || $this->type === 'object' || $this->type === 'boolean') {
            return json_decode($value, true);
        }

        // --- فیکس مشکل نمایش یونیکد ---
        // اگر نوع "string" است اما مقدار داخل دیتابیس شبیه JSON String است (مثلا "\u062a...")
        // تلاش می‌کنیم آن را دیکد کنیم تا به متن اصلی برسیم.
        if ($this->type === 'string') {
            // تلاش برای دیکد کردن (مثلاً اگر مقدار "تهران" با کوتیشن ذخیره شده باشد)
            $decoded = json_decode($value);
            
            // اگر دیکد موفق بود و خروجی یک رشته سالم بود، آن را برگردان
            if (json_last_error() === JSON_ERROR_NONE && is_string($decoded)) {
                return $decoded;
            }
        }

        return $value;
    }

    /**
     * ذخیره مقدار با توجه به نوع
     * اصلاح شده برای استفاده از JSON_UNESCAPED_UNICODE
     */
    public function setValueAttribute($value)
    {
        if (is_array($value) || is_bool($value) || is_object($value)) {
            // استفاده از JSON_UNESCAPED_UNICODE برای خوانایی فارسی در دیتابیس
            $this->attributes['value'] = json_encode($value, JSON_UNESCAPED_UNICODE);
        } else {
            // ذخیره رشته‌ها به صورت خام (بدون انکد اضافی)
            $this->attributes['value'] = (string) $value;
        }
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای تنظیمات گروه خاص
     */
    public function scopeGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * اسکوپ برای تنظیمات عمومی
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * اسکوپ برای تنظیمات خصوصی
     */
    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    /**
     * اسکوپ برای تنظیمات با نوع خاص
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * اسکوپ برای تنظیمات فعال
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    // ==================== توابع کمکی ====================

    /**
     * دریافت مقدار تنظیمات
     */
    public static function getValue($group, $key, $default = null)
    {
        $setting = self::where('group', $group)
            ->where('key', $key)
            ->active()
            ->first();

        if ($setting) {
            return $setting->value;
        }

        return $default;
    }

    /**
     * ذخیره مقدار تنظیمات
     */
    public static function setValue($group, $key, $value, $label = null, $description = null)
    {
        $setting = self::where('group', $group)
            ->where('key', $key)
            ->first();

        $type = self::detectType($value);

        if ($setting) {
            $setting->update([
                'value' => $value,
                'type' => $type,
                'label' => $label ?: $setting->label,
                'description' => $description ?: $setting->description,
            ]);
        } else {
            $setting = self::create([
                'group' => $group,
                'key' => $key,
                'value' => $value,
                'type' => $type,
                'label' => $label ?: ucfirst(str_replace('_', ' ', $key)),
                'description' => $description,
                'is_public' => false,
            ]);
        }

        return $setting;
    }

    /**
     * تشخیص نوع مقدار
     */
    private static function detectType($value)
    {
        if (is_array($value) || is_object($value)) {
            return 'array';
        } elseif (is_bool($value)) {
            return 'boolean';
        } elseif (is_numeric($value) && !is_string($value)) { // چک دقیق‌تر برای اعداد
            return 'number';
        } else {
            return 'string';
        }
    }

    /**
     * دریافت تمام تنظیمات یک گروه
     */
    public static function getAllGroupSettings($group)
    {
        return self::where('group', $group)
            ->active()
            ->get()
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * دریافت تنظیمات به صورت کلید-مقدار
     */
    public static function getSettingsArray($group = null)
    {
        $query = self::query();
        
        if ($group) {
            $query->where('group', $group);
        }

        return $query->active()
            ->get()
            ->mapWithKeys(function($setting) {
                return [$setting->group . '.' . $setting->key => $setting->value];
            })
            ->toArray();
    }

    /**
     * حذف تنظیمات
     */
    public static function removeSetting($group, $key)
    {
        return self::where('group', $group)
            ->where('key', $key)
            ->delete();
    }

    /**
     * دریافت تنظیمات عمومی برای نمایش
     */
    public static function getPublicSettings()
    {
        return self::public()
            ->active()
            ->get()
            ->map(function($setting) {
                return [
                    'key' => $setting->key,
                    'label' => $setting->label,
                    'value' => $setting->value,
                    'type' => $setting->type,
                    'description' => $setting->description,
                ];
            })
            ->groupBy('group')
            ->toArray();
    }

    /**
     * دریافت تنظیمات سیستمی مهم
     */
    public static function getSystemDefaults()
    {
        return [
            'points' => [
                'point_expiry_days' => 365,
                'min_points_for_spend' => 100,
                'max_daily_earn' => 1000,
            ],
            'referral' => [
                'referral_levels' => 3,
                'referral_commission_rates' => [
                    'level_1' => 200,
                    'level_2' => 100,
                    'level_3' => 50,
                ],
                'max_daily_referrals' => 10,
                'min_commission_payout' => 1000,
            ],
            'club' => [
                'auto_upgrade_enabled' => true,
                'upgrade_approval_required' => true,
            ],
            'survey' => [
                'default_max_attempts' => 1,
                'quiz_time_limit' => 1800, // 30 دقیقه
            ],
            'sms' => [
                'provider' => 'kavenegar',
                'max_otp_attempts' => 3,
                'otp_expiry_minutes' => 5,
            ],
            'email' => [
                'provider' => 'mail',
                'from_address' => 'noreply@clubinex.com',
                'from_name' => 'Clubinex',
            ],
        ];
    }

    /**
     * بارگذاری تنظیمات پیش‌فرض
     */
    public static function loadDefaults()
    {
        $defaults = self::getSystemDefaults();
        
        foreach ($defaults as $group => $settings) {
            foreach ($settings as $key => $value) {
                self::setValue($group, $key, $value);
            }
        }
    }

    /**
     * اعتبارسنجی تنظیمات
     */
    public function validate()
    {
        $validators = [
            'number' => 'numeric',
            'boolean' => 'boolean',
            'string' => 'string',
            'array' => 'array',
            'object' => 'array',
        ];

        $validator = $validators[$this->type] ?? null;
        
        if ($validator) {
            return gettype($this->value) === $validator;
        }

        return true;
    }

    /**
     * دریافت برچسب کامل تنظیمات
     */
    public function getFullLabelAttribute()
    {
        return "{$this->group}.{$this->key}";
    }

    /**
     * بررسی آیا تنظیمات قابل نمایش برای کاربر است
     */
    public function isDisplayable()
    {
        return $this->is_public && $this->validate();
    }

    /**
     * دریافت مقدار به صورت فرمت شده
     */
    public function getFormattedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return $this->value ? 'بله' : 'خیر';
            case 'array':
                return is_array($this->value) ? implode(', ', $this->value) : json_encode($this->value, JSON_UNESCAPED_UNICODE);
            default:
                return $this->value;
        }
    }
}