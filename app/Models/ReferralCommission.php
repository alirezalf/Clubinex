<?php

namespace App\Models;

use Morilog\Jalali\Jalalian;
use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReferralCommission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'referral_network_id',  // معرفی مرتبط
        'level',                // سطح دریافت کمیسیون
        'commission_type',      // نوع کمیسیون (درصدی/ثابت)
        'commission_value',     // مقدار کمیسیون
        'earned_points',        // امتیاز کسب شده
        'point_rule_id',        // قانون امتیاز مرتبط
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'level' => 'integer',               // تبدیل به عدد صحیح
        'commission_value' => 'decimal:2',  // تبدیل به اعشار با ۲ رقم اعشار
        'earned_points' => 'integer',       // تبدیل به عدد صحیح
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با معرفی
     */
    public function referralNetwork()
    {
        return $this->belongsTo(ReferralNetwork::class);
    }

    /**
     * رابطه چند به یک با قانون امتیاز
     */
    public function pointRule()
    {
        return $this->belongsTo(PointRule::class);
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای کمیسیون‌های سطح خاص
     * @param int $level سطح مورد نظر
     */
    public function scopeLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * اسکوپ برای کمیسیون‌های درصدی
     */
    public function scopePercentageType($query)
    {
        return $query->where('commission_type', 'percentage');
    }

    /**
     * اسکوپ برای کمیسیون‌های ثابت
     */
    public function scopeFixedType($query)
    {
        return $query->where('commission_type', 'fixed');
    }

    /**
     * اسکوپ برای کمیسیون‌های کاربر خاص
     * @param int $userId شناسه کاربر
     */
    public function scopeByUser($query, $userId)
    {
        return $query->whereHas('referralNetwork', function($q) use ($userId) {
            $q->where('referrer_id', $userId);
        });
    }

    /**
     * اسکوپ برای کمیسیون‌های در بازه زمانی
     * @param string $startDate تاریخ شروع
     * @param string $endDate تاریخ پایان
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * اسکوپ برای کمیسیون‌های با مقدار بالاتر از حد مشخص
     * @param float $minValue حداقل مقدار
     */
    public function scopeMinValue($query, $minValue)
    {
        return $query->where('earned_points', '>=', $minValue);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا کمیسیون درصدی است
     * @return bool
     */
    public function isPercentage()
    {
        return $this->commission_type === 'percentage';
    }

    /**
     * بررسی آیا کمیسیون ثابت است
     * @return bool
     */
    public function isFixed()
    {
        return $this->commission_type === 'fixed';
    }

    /**
     * دریافت مقدار کمیسیون به صورت فرمت شده
     * @return string مقدار فرمت شده
     */
    public function getCommissionValueFormattedAttribute()
    {
        if ($this->isPercentage()) {
            return "{$this->commission_value}%";
        }
        return number_format($this->commission_value);
    }

    /**
     * دریافت مقدار کمیسیون بر اساس نوع
     * @param float $baseAmount مقدار پایه (برای درصدی)
     * @return float مقدار کمیسیون
     */
    public function calculateCommission($baseAmount = null)
    {
        if ($this->isPercentage() && !is_null($baseAmount)) {
            return round(($baseAmount * $this->commission_value) / 100, 2);
        }
        return $this->commission_value;
    }

    /**
     * دریافت زمان ایجاد به شمسی
     * @return string تاریخ شمسی
     */
    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }

    /**
     * دریافت کاربر معرف (از طریق referral network)
     * @return User|null کاربر معرف
     */
    public function getReferrerAttribute()
    {
        return $this->referralNetwork->referrer ?? null;
    }

    /**
     * دریافت کاربر معرفی‌شده (از طریق referral network)
     * @return User|null کاربر معرفی‌شده
     */
    public function getReferredAttribute()
    {
        return $this->referralNetwork->referred ?? null;
    }

    /**
     * ایجاد کمیسیون جدید
     * @param array $data اطلاعات کمیسیون
     * @return ReferralCommission|null کمیسیون ایجاد شده
     */
    public static function createCommission($data)
    {
        // بررسی وجود کمیسیون تکراری
        $existingCommission = self::where([
            'referral_network_id' => $data['referral_network_id'],
            'level' => $data['level'],
        ])->first();

        if ($existingCommission) {
            return null;
        }

        $commission = self::create($data);

        if ($commission) {
            // ثبت لاگ فعالیت
            ActivityLog::log(
                'referral.commission_created',
                "کمیسیون سطح {$commission->level} برای معرفی ایجاد شد. مقدار: {$commission->earned_points} امتیاز",
                [
                    'user_id' => $commission->referrer->id ?? null,
                    'model_type' => self::class,
                    'model_id' => $commission->id,
                    'reference_type' => ReferralNetwork::class,
                    'reference_id' => $commission->referral_network_id,
                ]
            );
        }

        return $commission;
    }

    /**
     * دریافت مجموع کمیسیون‌های کاربر
     * @param int $userId شناسه کاربر
     * @param string|null $period دوره زمانی
     * @return float مجموع کمیسیون‌ها
     */
    public static function getUserTotalCommissions($userId, $period = null)
    {
        $query = self::byUser($userId);

        if ($period === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($period === 'month') {
            $query->whereMonth('created_at', now()->month);
        } elseif ($period === 'year') {
            $query->whereYear('created_at', now()->year);
        }

        return $query->sum('earned_points');
    }

    /**
     * دریافت آمار کمیسیون‌های کاربر
     * @param int $userId شناسه کاربر
     * @return array آمار کمیسیون‌ها
     */
    public static function getUserCommissionStats($userId)
    {
        $stats = [
            'total' => 0,
            'by_level' => [],
            'by_type' => [],
            'recent' => [],
        ];

        // کل کمیسیون‌ها
        $stats['total'] = self::getUserTotalCommissions($userId);

        // بر اساس سطح
        for ($level = 1; $level <= 3; $level++) {
            $stats['by_level'][$level] = self::byUser($userId)
                ->level($level)
                ->sum('earned_points');
        }

        // بر اساس نوع
        $stats['by_type']['percentage'] = self::byUser($userId)
            ->percentageType()
            ->sum('earned_points');

        $stats['by_type']['fixed'] = self::byUser($userId)
            ->fixedType()
            ->sum('earned_points');

        // جدیدترین‌ها
        $stats['recent'] = self::byUser($userId)
            ->with('referralNetwork.referred')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($commission) {
                return [
                    'id' => $commission->id,
                    'level' => $commission->level,
                    'type' => $commission->commission_type,
                    'points' => $commission->earned_points,
                    'referred_user' => $commission->referred->full_name ?? 'نامشخص',
                    'date' => $commission->getCreatedAtJalaliAttribute(),
                ];
            })
            ->toArray();

        return $stats;
    }

    /**
     * محاسبه کمیسیون بر اساس سطح و مقدار پایه
     * @param int $level سطح
     * @param float $baseAmount مقدار پایه
     * @return float مقدار کمیسیون
     */
    public static function calculateCommissionForLevel($level, $baseAmount)
    {
        // دریافت نرخ‌های کمیسیون از تنظیمات
        $commissionRates = SystemSetting::getValue('referral', 'referral_commission_rates', [
            'level_1' => 200,
            'level_2' => 100,
            'level_3' => 50,
        ]);

        $commissionKey = 'level_' . $level;
        return $commissionRates[$commissionKey] ?? 0;
    }

    /**
     * بررسی آیا کمیسیون قابل پرداخت است
     * @return bool
     */
    public function isPayable()
    {
        // شرایط پرداخت:
        // 1. معرفی باید فعال باشد
        // 2. کاربر معرف باید فعال باشد
        // 3. حداقل مقدار پرداخت رعایت شده باشد

        if (!$this->referralNetwork || !$this->referralNetwork->isActive()) {
            return false;
        }

        if (!$this->referrer || !$this->referrer->isActive()) {
            return false;
        }

        $minCommission = SystemSetting::getValue('referral', 'min_commission_payout', 1000);
        if ($this->earned_points < $minCommission) {
            return false;
        }

        return true;
    }

    /**
     * علامت گذاری کمیسیون به عنوان پرداخت شده
     * @param string $paymentMethod روش پرداخت
     * @param string $transactionId شناسه تراکنش پرداخت
     * @param int $adminId شناسه مدیر (اگر توسط مدیر انجام شود)
     * @return bool
     */
    public function markAsPaid($paymentMethod, $transactionId, $adminId = null)
    {
        if (!$this->isPayable()) {
            return false;
        }

        // ایجاد تراکنش پرداخت
        $result = $this->update([
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
        ]);

        if ($result) {
            ActivityLog::log(
                'referral.commission_paid',
                "کمیسیون سطح {$this->level} به مبلغ {$this->earned_points} امتیاز پرداخت شد",
                [
                    'user_id' => $this->referrer->id ?? null,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'reference_type' => ReferralNetwork::class,
                    'reference_id' => $this->referral_network_id,
                    'old_values' => ['paid_at' => null],
                    'new_values' => ['paid_at' => now()],
                ]
            );
        }

        return $result;
    }

    /**
     * دریافت تاریخ پرداخت به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getPaidAtJalaliAttribute()
    {
        return $this->paid_at ? Jalalian::fromDateTime($this->paid_at)->format('Y/m/d H:i') : null;
    }

    /**
     * بررسی آیا کمیسیون پرداخت شده است
     * @return bool
     */
    public function isPaid()
    {
        return !is_null($this->paid_at);
    }

    /**
     * دریافت اطلاعات نمایشی کمیسیون
     * @return array اطلاعات نمایشی
     */
    public function getDisplayInfoAttribute()
    {
        return [
            'id' => $this->id,
            'referrer_name' => $this->referrer->full_name ?? 'نامشخص',
            'referrer_mobile' => $this->referrer->mobile ?? 'نامشخص',
            'referred_name' => $this->referred->full_name ?? 'نامشخص',
            'referred_mobile' => $this->referred->mobile ?? 'نامشخص',
            'level_text' => $this->getLevelText(),
            'type_text' => $this->getTypeText(),
            'commission_value' => $this->getCommissionValueFormattedAttribute(),
            'earned_points' => number_format($this->earned_points),
            'created_date' => $this->getCreatedAtJalaliAttribute(),
            'paid_date' => $this->getPaidAtJalaliAttribute(),
            'is_paid' => $this->isPaid() ? 'پرداخت شده' : 'در انتظار پرداخت',
            'is_payable' => $this->isPayable() ? 'قابل پرداخت' : 'غیرقابل پرداخت',
        ];
    }

    /**
     * دریافت متن سطح
     * @return string
     */
    public function getLevelText()
    {
        $levels = [
            1 => 'مستقیم',
            2 => 'غیرمستقیم سطح ۲',
            3 => 'غیرمستقیم سطح ۳',
        ];

        return $levels[$this->level] ?? "سطح {$this->level}";
    }

    /**
     * دریافت متن نوع کمیسیون
     * @return string
     */
    public function getTypeText()
    {
        $types = [
            'percentage' => 'درصدی',
            'fixed' => 'ثابت',
        ];

        return $types[$this->commission_type] ?? $this->commission_type;
    }
}