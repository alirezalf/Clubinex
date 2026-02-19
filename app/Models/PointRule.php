<?php

namespace App\Models;

use App\Models\User;
use Morilog\Jalali\Jalalian;
use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PointRule extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'points_required',  // حداقل امتیازی که کاربر باید داشته باشد تا بتواند این جایزه را دریافت کند
        'stock',            // تعداد موجودی جایزه، یعنی چند بار می‌توان این جایزه را خریداری کرد
        'action_code',      // کد یکتای عمل (برای برنامه‌نویسی)
        'title',           // عنوان قانون (برای نمایش)
        'description',     // توضیحات کامل قانون
        'points',          // مقدار امتیاز (مثبت: پاداش، منفی: جریمه)
        'type',            // نوع قانون (یک‌بار، تکرارشونده، شرطی)
        'conditions',      // شرایط اجرا (ذخیره به صورت JSON)
        'max_per_user',    // حداکثر دفعات اجرا برای هر کاربر
        'is_active',       // فعال بودن قانون
        'valid_from',      // اعتبار از تاریخ
        'valid_to',        // اعتبار تا تاریخ
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'points' => 'integer',          // تبدیل به عدد صحیح
        'conditions' => 'array',        // تبدیل JSON به آرایه
        'max_per_user' => 'integer',    // تبدیل به عدد صحیح
        'is_active' => 'boolean',       // تبدیل به بولین
        'valid_from' => 'datetime',     // تبدیل به تاریخ
        'valid_to' => 'datetime',       // تبدیل به تاریخ
    ];

    // ==================== روابط ====================

    /**
     * رابطه یک به چند با تراکنش‌های امتیازی
     */
    public function transactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    /**
     * رابطه یک به چند با کمیسیون‌های معرف
     */
    public function referralCommissions()
    {
        return $this->hasMany(ReferralCommission::class);
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای قوانین فعال
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * اسکوپ برای قوانین معتبر (از نظر تاریخ)
     */
    public function scopeValid($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_to')->orWhere('valid_to', '>=', $now);
            });
    }

    /**
     * اسکوپ برای قوانین یک‌بار مصرف
     */
    public function scopeOneTime($query)
    {
        return $query->where('type', 'one_time');
    }

    /**
     * اسکوپ برای قوانین تکرارشونده
     */
    public function scopeRepeatable($query)
    {
        return $query->where('type', 'repeatable');
    }

    /**
     * اسکوپ برای قوانین شرطی
     */
    public function scopeConditional($query)
    {
        return $query->where('type', 'conditional');
    }

    /**
     * اسکوپ برای قوانین کسب امتیاز (مثبت)
     */
    public function scopeEarning($query)
    {
        return $query->where('points', '>', 0);
    }

    /**
     * اسکوپ برای قوانین کسر امتیاز (منفی)
     */
    public function scopeDeduction($query)
    {
        return $query->where('points', '<', 0);
    }

    /**
     * اسکوپ برای قوانین با کد عمل خاص
     * @param string $actionCode کد عمل
     */
    public function scopeByActionCode($query, $actionCode)
    {
        return $query->where('action_code', $actionCode);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی اعتبار قانون (از نظر تاریخ و فعال بودن)
     * @return bool
     */
    public function isValid()
    {
        $now = now();
        return $this->is_active &&
            (!$this->valid_from || $this->valid_from <= $now) &&
            (!$this->valid_to || $this->valid_to >= $now);
    }

    /**
     * دریافت لیست شرایط به صورت آرایه
     * @return array لیست شرایط
     */
    public function getConditionsListAttribute()
    {
        return $this->conditions ?? [];
    }

    /**
     * بررسی آیا قانون یک‌بار مصرف است
     * @return bool
     */
    public function isOneTime()
    {
        return $this->type === 'one_time';
    }

    /**
     * بررسی آیا قانون تکرارشونده است
     * @return bool
     */
    public function isRepeatable()
    {
        return $this->type === 'repeatable';
    }

    /**
     * بررسی آیا قانون شرطی است
     * @return bool
     */
    public function isConditional()
    {
        return $this->type === 'conditional';
    }

    /**
     * بررسی آیا قانون کسب امتیاز است
     * @return bool
     */
    public function isEarning()
    {
        return $this->points > 0;
    }

    /**
     * بررسی آیا قانون کسر امتیاز است
     * @return bool
     */
    public function isDeduction()
    {
        return $this->points < 0;
    }

    /**
     * بررسی آیا کاربر می‌تواند از این قانون استفاده کند
     * @param int $userId شناسه کاربر
     * @param array $contextData داده‌های مرتبط با زمینه اجرا
     * @return array [result => bool, reason => string]
     */
    public function canUserApply($userId, $contextData = [])
    {
        // بررسی اعتبار قانون
        if (!$this->isValid()) {
            return ['result' => false, 'reason' => 'قانون فعال یا معتبر نیست'];
        }

        // بررسی حداکثر دفعات استفاده برای کاربر
        if ($this->max_per_user) {
            $usageCount = $this->transactions()
                ->where('user_id', $userId)
                ->count();

            if ($usageCount >= $this->max_per_user) {
                return ['result' => false, 'reason' => 'حداکثر دفعات استفاده از این قانون رسیده است'];
            }
        }

        // بررسی شرایط شرطی
        if ($this->isConditional() && !empty($this->conditions)) {
            $conditions = $this->getConditionsListAttribute();

            // بررسی شرط حداقل/حداکثر نمره
            if (isset($conditions['min_score']) && isset($conditions['max_score'])) {
                $score = $contextData['score'] ?? 0;
                if ($score < $conditions['min_score'] || $score > $conditions['max_score']) {
                    return ['result' => false, 'reason' => 'شرط نمره برقرار نیست'];
                }
            }

            // بررسی شرط حداقل مدت زمان
            if (isset($conditions['min_duration'])) {
                $duration = $contextData['duration'] ?? 0;
                if ($duration < $conditions['min_duration']) {
                    return ['result' => false, 'reason' => 'شرط مدت زمان برقرار نیست'];
                }
            }

            // بررسی شرط نوع رویداد
            if (isset($conditions['event'])) {
                $event = $contextData['event'] ?? '';
                if ($event !== $conditions['event']) {
                    return ['result' => false, 'reason' => 'شرط رویداد برقرار نیست'];
                }
            }
        }

        return ['result' => true, 'reason' => ''];
    }

    /**
     * دریافت تعداد استفاده‌های کاربر از این قانون
     * @param int $userId شناسه کاربر
     * @return int تعداد استفاده
     */
    public function getUserUsageCount($userId)
    {
        return $this->transactions()
            ->where('user_id', $userId)
            ->count();
    }

    /**
     * دریافت تعداد دفعات باقی‌مانده برای کاربر
     * @param int $userId شناسه کاربر
     * @return int|null تعداد باقی‌مانده یا null اگر محدودیت نداشته باشد
     */
    public function getRemainingUsageForUser($userId)
    {
        if (is_null($this->max_per_user)) {
            return null;
        }

        $used = $this->getUserUsageCount($userId);
        return max(0, $this->max_per_user - $used);
    }

    /**
     * دریافت زمان شروع اعتبار به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getValidFromJalaliAttribute()
    {
        return $this->valid_from ? Jalalian::fromDateTime($this->valid_from)->format('Y/m/d H:i') : null;
    }

    /**
     * دریافت زمان پایان اعتبار به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getValidToJalaliAttribute()
    {
        return $this->valid_to ? Jalalian::fromDateTime($this->valid_to)->format('Y/m/d H:i') : null;
    }

    /**
     * محاسبه مدت زمان باقی‌مانده تا انقضا
     * @return string|null مدت زمان باقی‌مانده یا null
     */
    public function getRemainingValidityAttribute()
    {
        if (!$this->valid_to || $this->valid_to <= now()) {
            return null;
        }

        $diff = now()->diff($this->valid_to);

        if ($diff->days > 0) {
            return "{$diff->days} روز";
        } elseif ($diff->h > 0) {
            return "{$diff->h} ساعت";
        } else {
            return "{$diff->i} دقیقه";
        }
    }

    /**
     * اعمال قانون برای کاربر
     * @param int $userId شناسه کاربر
     * @param array $contextData داده‌های مرتبط
     * @param string|null $description توضیح اضافی
     * @return PointTransaction|null تراکنش ایجاد شده
     */
    public function applyToUser($userId, $contextData = [], $description = null)
    {
        // بررسی امکان اعمال قانون
        $canApply = $this->canUserApply($userId, $contextData);
        if (!$canApply['result']) {
            ActivityLog::log(
                'point.rule_failed',
                "قانون {$this->title} برای کاربر قابل اعمال نیست. دلیل: {$canApply['reason']}",
                [
                    'user_id' => $userId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'severity' => 'warning',
                ]
            );
            return null;
        }

        // ایجاد تراکنش امتیازی
        $transaction = PointTransaction::create([
            'user_id' => $userId,
            'type' => $this->isEarning() ? 'earn' : 'spend',
            'amount' => $this->points,
            'point_rule_id' => $this->id,
            'reference_type' => $contextData['reference_type'] ?? null,
            'reference_id' => $contextData['reference_id'] ?? null,
            'description' => $description ?? $this->title,
            'balance_after' => User::find($userId)->current_points + $this->points,
            'expires_at' => $this->calculateExpirationDate(),
        ]);

        if ($transaction) {
            // ثبت لاگ فعالیت
            ActivityLog::log(
                'point.rule_applied',
                "قانون {$this->title} برای کاربر اعمال شد. امتیاز: {$this->points}",
                [
                    'user_id' => $userId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'reference_type' => PointTransaction::class,
                    'reference_id' => $transaction->id,
                ]
            );
        }

        return $transaction;
    }

    /**
     * محاسبه تاریخ انقضای امتیاز
     * @return \Carbon\Carbon|null تاریخ انقضا یا null
     */
    public function calculateExpirationDate()
    {
        if (!$this->isEarning()) {
            return null; // فقط امتیازات کسب شده انقضا دارند
        }

        $expiryDays = SystemSetting::getValue('points', 'point_expiry_days', 365);

        if ($expiryDays > 0) {
            return now()->addDays($expiryDays);
        }

        return null;
    }


    /**
     فعال کردن قانون
     * @return bool
     */
    public function activate()
    {
        $result = $this->update(['is_active' => true]);

        if ($result) {
            ActivityLog::log(
                'point.rule_activated',
                "قانون امتیاز {$this->title} فعال شد",
                [
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['is_active' => false],
                    'new_values' => ['is_active' => true],
                ]
            );
        }

        return $result;
    }

    /**
     * غیرفعال کردن قانون
     * @return bool
     */
    public function deactivate()
    {
        $result = $this->update(['is_active' => false]);

        if ($result) {
            ActivityLog::log(
                'point.rule_deactivated',
                "قانون امتیاز {$this->title} غیرفعال شد",
                [
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['is_active' => true],
                    'new_values' => ['is_active' => false],
                ]
            );
        }

        return $result;
    }

    /**
     * دریافت آمار استفاده از قانون
     * @return array آمار قانون
     */
    public function getStatisticsAttribute()
    {
        return [
            'total_transactions' => $this->transactions()->count(),
            'total_users' => $this->transactions()->distinct('user_id')->count('user_id'),
            'total_points' => $this->transactions()->sum('amount'),
            'average_per_user' => $this->transactions()->avg('amount'),
            'last_used_at' => $this->transactions()->latest()->first()?->created_at,
        ];
    }

    /**
     * بررسی آیا قانون قابل حذف است
     * @return bool
     */
    public function isDeletable()
    {
        return $this->transactions()->count() === 0;
    }
}