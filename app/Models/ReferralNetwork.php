<?php

namespace App\Models;

use App\Models\PointRule;
use Morilog\Jalali\Jalalian;
use App\Models\SystemSetting;
use App\Models\PointTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReferralNetwork extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'referral_network';
    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'referrer_id',      // شناسه کاربر معرف
        'referred_id',      // شناسه کاربر معرفی‌شده
        'level',            // سطح معرفی (1: مستقیم، 2: غیرمستقیم، ...)
        'status',           // وضعیت معرفی
        'activated_at',     // زمان فعال‌شدن معرفی
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'level' => 'integer',           // تبدیل به عدد صحیح
        'activated_at' => 'datetime',   // تبدیل به تاریخ
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با کاربر معرف
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * رابطه چند به یک با کاربر معرفی‌شده
     */
    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    /**
     * رابطه یک به چند با کمیسیون‌های دریافتی
     */
    public function commissions()
    {
        return $this->hasMany(ReferralCommission::class);
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای معرفی‌های فعال
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * اسکوپ برای معرفی‌های در انتظار
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * اسکوپ برای معرفی‌های رد شده
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * اسکوپ برای معرفی‌های سطح خاص
     * @param int $level سطح مورد نظر
     */
    public function scopeLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    /**
     * اسکوپ برای معرفی‌های مستقیم (سطح 1)
     */
    public function scopeDirect($query)
    {
        return $query->where('level', 1);
    }

    /**
     * اسکوپ برای معرفی‌های غیرمستقیم (سطح 2 به بالا)
     */
    public function scopeIndirect($query)
    {
        return $query->where('level', '>', 1);
    }

    /**
     * اسکوپ برای معرفی‌های کاربر خاص (به عنوان معرف)
     * @param int $userId شناسه کاربر
     */
    public function scopeByReferrer($query, $userId)
    {
        return $query->where('referrer_id', $userId);
    }

    /**
     * اسکوپ برای معرفی‌های کاربر خاص (به عنوان معرفی‌شده)
     * @param int $userId شناسه کاربر
     */
    public function scopeByReferred($query, $userId)
    {
        return $query->where('referred_id', $userId);
    }

    /**
     * اسکوپ برای معرفی‌های در بازه زمانی
     * @param string $startDate تاریخ شروع
     * @param string $endDate تاریخ پایان
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا معرفی فعال است
     * @return bool
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * بررسی آیا معرفی در انتظار است
     * @return bool
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * بررسی آیا معرفی رد شده است
     * @return bool
     */

    public function isRejected()
    {
        return $this->status === 'rejected';
    }


    /**
     * بررسی آیا معرفی مستقیم است (سطح 1)
     * @return bool
     */
    public function isDirect()
    {
        return $this->level === 1;
    }

    /**
     * بررسی آیا معرفی غیرمستقیم است (سطح 2 به بالا)
     * @return bool
     */
    public function isIndirect()
    {
        return $this->level > 1;
    }

    /**
     * دریافت زمان فعال‌شدن به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getActivatedAtJalaliAttribute()
    {
        return $this->activated_at ? Jalalian::fromDateTime($this->activated_at)->format('Y/m/d H:i') : null;
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
     * محاسبه مدت زمان انتظار برای فعال‌شدن
     * @return int|null مدت زمان بر حسب ساعت یا null
     */
    public function getWaitingTimeAttribute()
    {
        if ($this->activated_at) {
            return $this->created_at->diffInHours($this->activated_at);
        }
        return $this->created_at->diffInHours(now());
    }

    /**
     * دریافت مجموع کمیسیون‌های دریافتی
     * @return int مجموع امتیازات دریافتی
     */
    public function getTotalCommissionsAttribute()
    {
        return $this->commissions()->sum('earned_points');
    }

    /**
     * فعال کردن معرفی (زمانی که کاربر معرفی‌شده ثبت‌نام خود را تکمیل می‌کند)
     * @return bool
     */
    public function activate()
    {
        // بررسی اینکه آیا کاربر معرفی‌شده پروفایل خود را تکمیل کرده است
        if (!$this->referred->profile_completed) {
            return false;
        }

        $result = $this->update([
            'status' => 'active',
            'activated_at' => now(),
        ]);

        if ($result) {
            // ایجاد کمیسیون برای معرف
            $this->createCommission();

            // ثبت لاگ فعالیت
            ActivityLog::log(
                'referral.activated',
                "معرفی کاربر {$this->referred->mobile} توسط {$this->referrer->mobile} فعال شد",
                [
                    'user_id' => $this->referrer_id,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'reference_type' => User::class,
                    'reference_id' => $this->referred_id,
                ]
            );
        }

        return $result;
    }

    /**
     * ایجاد کمیسیون برای معرف
     */
    private function createCommission()
    {
        // دریافت تنظیمات کمیسیون‌ها
        $commissionRates = SystemSetting::getValue('referral', 'referral_commission_rates', [
            'level_1' => 200,
            'level_2' => 100,
            'level_3' => 50,
        ]);

        // دریافت قانون امتیاز معرفی
        $pointRule = PointRule::where('action_code', 'referral_level_1')->first();
        if (!$pointRule) {
            return;
        }

        // محاسبه امتیاز بر اساس سطح
        $commissionKey = 'level_' . $this->level;
        $earnedPoints = $commissionRates[$commissionKey] ?? 0;

        if ($earnedPoints > 0) {
            ReferralCommission::create([
                'referral_network_id' => $this->id,
                'level' => $this->level,
                'commission_type' => 'fixed',
                'commission_value' => $earnedPoints,
                'earned_points' => $earnedPoints,
                'point_rule_id' => $pointRule->id,
            ]);

            // اعطای امتیاز به معرف
            PointTransaction::awardPoints(
                $this->referrer_id,
                $earnedPoints,
                $pointRule->id,
                "کمیسیون معرفی سطح {$this->level} - کاربر {$this->referred->mobile}",
                $this
            );
        }
    }

    /**
     * رد کردن معرفی (زمانی که معرفی معتبر نیست)
     * @param string $reason دلیل رد
     * @param int|null $adminId شناسه مدیر (اگر توسط مدیر انجام شود)
     * @return bool
     */
    public function reject($reason = '', $adminId = null)
    {
        $result = $this->update([
            'status' => 'rejected',
        ]);

        if ($result) {
            ActivityLog::log(
                'referral.rejected',
                "معرفی کاربر {$this->referred->mobile} توسط {$this->referrer->mobile} رد شد. دلیل: {$reason}",
                [
                    'user_id' => $this->referrer_id,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'reference_type' => User::class,
                    'reference_id' => $this->referred_id,
                    'severity' => 'warning',
                ]
            );
        }

        return $result;
    }

    /**
     * بررسی امکان فعال‌سازی خودکار
     * @return bool
     */
    public function canAutoActivate()
    {
        // اگر کاربر معرفی‌شده پروفایل خود را تکمیل کرده باشد
        return $this->referred->profile_completed;
    }

    /**
     * ایجاد معرفی جدید
     * @param int $referrerId شناسه معرف
     * @param int $referredId شناسه معرفی‌شده
     * @return ReferralNetwork|null معرفی ایجاد شده
     */
    public static function createReferral($referrerId, $referredId)
    {
        // بررسی وجود معرفی قبلی
        $existingReferral = self::where('referred_id', $referredId)->first();
        if ($existingReferral) {
            return null;
        }

        // بررسی اینکه معرف نمی‌تواند خودش را معرفی کند
        if ($referrerId === $referredId) {
            return null;
        }

        // پیدا کردن سطح (مستقیم = 1)
        $level = 1;

        // اگر معرف خودش معرف داشته باشد، سطح‌های بالاتر را ایجاد کنیم
        $referrer = User::find($referrerId);
        if ($referrer && $referrer->referred_by) {
            // ایجاد معرفی‌های غیرمستقیم برای معرف‌های بالاتر
            self::createIndirectReferrals($referrerId, $referredId);
        }

        // ایجاد معرفی مستقیم
        $referral = self::create([
            'referrer_id' => $referrerId,
            'referred_id' => $referredId,
            'level' => $level,
            'status' => 'pending',
        ]);

        if ($referral) {
            ActivityLog::log(
                'referral.created',
                "کاربر {$referral->referrer->mobile}، کاربر {$referral->referred->mobile} را معرفی کرد",
                [
                    'user_id' => $referrerId,
                    'model_type' => self::class,
                    'model_id' => $referral->id,
                    'reference_type' => User::class,
                    'reference_id' => $referredId,
                ]
            );
        }

        return $referral;
    }

    /**
     * ایجاد معرفی‌های غیرمستقیم
     * @param int $referrerId شناسه معرف مستقیم
     * @param int $referredId شناسه کاربر جدید
     * @param int $currentLevel سطح جاری (شروع از 2)
     */
    private static function createIndirectReferrals($referrerId, $referredId, $currentLevel = 2)
    {
        // دریافت حداکثر سطوح از تنظیمات
        $maxLevels = SystemSetting::getValue('referral', 'referral_levels', 3);

        if ($currentLevel > $maxLevels) {
            return;
        }

        $referrer = User::find($referrerId);
        if (!$referrer || !$referrer->referred_by) {
            return;
        }

        // ایجاد معرفی غیرمستقیم برای معرف بالاتر
        $indirectReferral = self::create([
            'referrer_id' => $referrer->referred_by,
            'referred_id' => $referredId,
            'level' => $currentLevel,
            'status' => 'pending',
        ]);

        // بازگشت برای سطح بعدی
        self::createIndirectReferrals($referrer->referred_by, $referredId, $currentLevel + 1);
    }

    /**
     * دریافت شبکه معرفی کاربر (درخت وارونه)
     * @param int $userId شناسه کاربر
     * @param int $maxDepth حداکثر عمق
     * @return array شبکه معرفی
     */
    public static function getUserNetwork($userId, $maxDepth = 3)
    {
        $network = [];
        self::buildNetworkTree($userId, 0, $maxDepth, $network);
        return $network;
    }

    /**
     * ساخت درخت شبکه به صورت بازگشتی
     */
    private static function buildNetworkTree($userId, $currentDepth, $maxDepth, &$network)
    {
        if ($currentDepth >= $maxDepth) {
            return;
        }

        $directReferrals = self::with('referred')
            ->where('referrer_id', $userId)
            ->where('level', 1)
            ->active()
            ->get();

        foreach ($directReferrals as $referral) {
            $userData = [
                'user' => $referral->referred,
                'referral_date' => $referral->getCreatedAtJalaliAttribute(),
                'level' => $currentDepth + 1,
                'children' => [],
            ];

            // بازگشت برای زیرشاخه‌ها
            self::buildNetworkTree(
                $referral->referred_id,
                $currentDepth + 1,
                $maxDepth,
                $userData['children']
            );

            $network[] = $userData;
        }
    }

    /**
     * دریافت آمار شبکه کاربر
     * @param int $userId شناسه کاربر
     * @return array آمار شبکه
     */
    public static function getUserNetworkStats($userId)
    {
        $stats = [
            'direct' => 0,
            'indirect' => 0,
            'total' => 0,
            'total_commission' => 0,
            'active' => 0,
            'pending' => 0,
        ];

        // آمار مستقیم
        $stats['direct'] = self::where('referrer_id', $userId)
            ->where('level', 1)
            ->count();

        // آمار غیرمستقیم
        $stats['indirect'] = self::where('referrer_id', $userId)
            ->where('level', '>', 1)
            ->count();

        $stats['total'] = $stats['direct'] + $stats['indirect'];

        // آمار بر اساس وضعیت
        $stats['active'] = self::where('referrer_id', $userId)
            ->where('status', 'active')
            ->count();

        $stats['pending'] = self::where('referrer_id', $userId)
            ->where('status', 'pending')
            ->count();

        // مجموع کمیسیون‌ها
        $referrals = self::where('referrer_id', $userId)->get();
        foreach ($referrals as $referral) {
            $stats['total_commission'] += $referral->total_commissions;
        }

        return $stats;
    }

    /**
     * بررسی آیا کاربر می‌تواند کاربر جدید معرفی کند
     * @param int $userId شناسه کاربر
     * @return bool
     */
    public static function canUserRefer($userId)
    {
        $user = User::find($userId);

        // بررسی فعال بودن کاربر
        if (!$user->isActive()) {
            return false;
        }

        // بررسی تکمیل پروفایل
        if (!$user->profile_completed) {
            return false;
        }

        // بررسی محدودیت‌های دیگر (مانند تعداد معرفی‌ها در روز)
        $todayReferrals = self::where('referrer_id', $userId)
            ->whereDate('created_at', today())
            ->count();

        $maxDailyReferrals = SystemSetting::getValue('referral', 'max_daily_referrals', 10);

        if ($todayReferrals >= $maxDailyReferrals) {
            return false;
        }

        return true;
    }

    /**
     * دریافت اطلاعات نمایشی معرفی
     * @return array اطلاعات نمایشی
     */
    public function getDisplayInfoAttribute()
    {
        return [
            'referrer_name' => $this->referrer->full_name,
            'referrer_mobile' => $this->referrer->mobile,
            'referred_name' => $this->referred->full_name,
            'referred_mobile' => $this->referred->mobile,
            'level_text' => $this->getLevelText(),
            'status_text' => $this->getStatusText(),
            'created_date' => $this->getCreatedAtJalaliAttribute(),
            'activated_date' => $this->getActivatedAtJalaliAttribute(),
            'waiting_time' => $this->waiting_time,
            'total_commission' => $this->total_commissions,
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
     * دریافت متن وضعیت
     * @return string
     */
    public function getStatusText()
    {
        $statuses = [
            'pending' => 'در انتظار تکمیل',
            'active' => 'فعال',
            'rejected' => 'رد شده',
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * دریافت کلاس رنگ وضعیت
     * @return string
     */
    public function getStatusColor()
    {
        $colors = [
            'pending' => 'warning',
            'active' => 'success',
            'rejected' => 'danger',
        ];

        return $colors[$this->status] ?? 'secondary';
    }
}