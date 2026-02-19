<?php

namespace App\Models;

use Morilog\Jalali\Jalalian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Survey extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'title',              // عنوان نظرسنجی
        'slug',               // نامک یکتا برای URL
        'description',        // توضیحات کامل نظرسنجی
        'type',               // نوع (مسابقه/نظرسنجی/فرم)
        'is_active',          // فعال بودن نظرسنجی
        'is_public',          // عمومی بودن (برای همه کاربران)
        'starts_at',          // زمان شروع نظرسنجی
        'ends_at',            // زمان پایان نظرسنجی
        'max_attempts',       // حداکثر دفعات شرکت
        'duration_minutes',   // مدت زمان آزمون (دقیقه)
        'required_club_id',   // حداقل سطح باشگاه برای شرکت
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'is_active' => 'boolean',      // تبدیل به بولین
        'is_public' => 'boolean',      // تبدیل به بولین
        'starts_at' => 'datetime',     // تبدیل به تاریخ
        'ends_at' => 'datetime',       // تبدیل به تاریخ
        'max_attempts' => 'integer',   // تبدیل به عدد صحیح
        'duration_minutes' => 'integer', // تبدیل به عدد صحیح
    ];

    // ==================== روابط ====================

    /**
     * رابطه یک به چند با سوالات نظرسنجی
     */
    public function questions()
    {
        return $this->hasMany(SurveyQuestion::class);
    }

    /**
     * رابطه یک به چند با پاسخ‌های نظرسنجی
     */
    public function answers()
    {
        return $this->hasMany(SurveyAnswer::class);
    }

    /**
     * رابطه چند به یک با باشگاه مورد نیاز
     */
    public function requiredClub()
    {
        return $this->belongsTo(Club::class, 'required_club_id');
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای نظرسنجی‌های فعال
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * اسکوپ برای نظرسنجی‌های عمومی
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * اسکوپ برای نظرسنجی‌های خصوصی
     */
    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    /**
     * اسکوپ برای نظرسنجی‌های مسابقه‌ای
     */
    public function scopeQuiz($query)
    {
        return $query->where('type', 'quiz');
    }

    /**
     * اسکوپ برای نظرسنجی‌های ساده
     */
    public function scopePoll($query)
    {
        return $query->where('type', 'poll');
    }

    /**
     * اسکوپ برای فرم‌ها
     */
    public function scopeForm($query)
    {
        return $query->where('type', 'form');
    }

    /**
     * اسکوپ برای نظرسنجی‌های در دسترس (بر اساس تاریخ)
     */
    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            });
    }

    /**
     * اسکوپ برای نظرسنجی‌های آینده
     */
    public function scopeUpcoming($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '>', now());
    }

    /**
     * اسکوپ برای نظرسنجی‌های گذشته
     */
    public function scopeExpired($query)
    {
        return $query->where('is_active', true)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now());
    }

    /**
     * اسکوپ برای نظرسنجی‌هایی که کاربر می‌تواند در آن شرکت کند
     * @param int $userId شناسه کاربر
     * @param int|null $clubId شناسه باشگاه کاربر
     */
    public function scopeAvailableForUser($query, $userId, $clubId = null)
    {
        return $query->available()
            ->where(function($q) use ($clubId) {
                $q->whereNull('required_club_id')
                  ->orWhere('required_club_id', '<=', $clubId);
            })
            ->whereDoesntHave('answers', function($q) use ($userId) {
                $q->where('user_id', $userId);
            });
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا نظرسنجی در دسترس است (بر اساس تاریخ)
     * @return bool
     */
    public function isAvailable()
    {
        $now = now();
        return $this->is_active &&
            (!$this->starts_at || $this->starts_at <= $now) &&
            (!$this->ends_at || $this->ends_at >= $now);
    }

    /**
     * بررسی آیا نظرسنجی عمومی است
     * @return bool
     */
    public function isPublic()
    {
        return $this->is_public;
    }

    /**
     * بررسی آیا نظرسنجی خصوصی است
     * @return bool
     */
    public function isPrivate()
    {
        return !$this->is_public;
    }

    /**
     * بررسی آیا نظرسنجی مسابقه است
     * @return bool
     */
    public function isQuiz()
    {
        return $this->type === 'quiz';
    }

    /**
     * بررسی آیا نظرسنجی ساده است
     * @return bool
     */
    public function isPoll()
    {
        return $this->type === 'poll';
    }

    /**
     * بررسی آیا فرم است
     * @return bool
     */
    public function isForm()
    {
        return $this->type === 'form';
    }

    /**
     * دریافت تعداد دفعات شرکت کاربر در این نظرسنجی
     * @param int $userId شناسه کاربر
     * @return int تعداد دفعات شرکت
     */
    public function getUserAttemptCount($userId)
    {
        return $this->answers()->where('user_id', $userId)->count();
    }

    /**
     * بررسی آیا کاربر می‌تواند در این نظرسنجی شرکت کند
     * @param int $userId شناسه کاربر
     * @param int|null $clubId شناسه باشگاه کاربر
     * @return array [result => bool, reason => string]
     */
    public function canUserParticipate($userId, $clubId = null)
    {
        // بررسی فعال بودن نظرسنجی
        if (!$this->isAvailable()) {
            return ['result' => false, 'reason' => 'نظرسنجی در دسترس نیست'];
        }

        // بررسی حداقل سطح باشگاه
        if ($this->required_club_id && (!$clubId || $clubId < $this->required_club_id)) {
            $clubName = $this->requiredClub->name ?? 'سطح خاص';
            return ['result' => false, 'reason' => "نیاز به عضویت در باشگاه {$clubName}"];
        }

        // بررسی محدودیت تعداد دفعات شرکت
        if ($this->max_attempts) {
            $attemptCount = $this->getUserAttemptCount($userId);
            if ($attemptCount >= $this->max_attempts) {
                return ['result' => false, 'reason' => 'تعداد دفعات مجاز شرکت تمام شده است'];
            }
        }

        return ['result' => true, 'reason' => ''];
    }

    /**
     * دریافت تعداد کل شرکت‌کنندگان
     * @return int تعداد شرکت‌کنندگان
     */
    public function getParticipantsCountAttribute()
    {
        return $this->answers()->distinct('user_id')->count('user_id');
    }

    /**
     * دریافت میانگین نمره نظرسنجی (برای مسابقات)
     * @return float|null میانگین نمره یا null
     */
    public function getAverageScoreAttribute()
    {
        if (!$this->isQuiz()) {
            return null;
        }

        return $this->answers()->avg('score');
    }

    /**
     * دریافت زمان شروع به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getStartsAtJalaliAttribute()
    {
        return $this->starts_at ? Jalalian::fromDateTime($this->starts_at)->format('Y/m/d H:i') : null;
    }

    /**
     * دریافت زمان پایان به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getEndsAtJalaliAttribute()
    {
        return $this->ends_at ? Jalalian::fromDateTime($this->ends_at)->format('Y/m/d H:i') : null;
    }

    /**
     * محاسبه مدت زمان باقی‌مانده تا پایان نظرسنجی
     * @return string|null مدت زمان باقی‌مانده یا null
     */
    public function getRemainingTimeAttribute()
    {
        if (!$this->ends_at || $this->ends_at <= now()) {
            return null;
        }

        $diff = now()->diff($this->ends_at);

        if ($diff->days > 0) {
            return "{$diff->days} روز";
        } elseif ($diff->h > 0) {
            return "{$diff->h} ساعت";
        } else {
            return "{$diff->i} دقیقه";
        }
    }

    /**
     * دریافت تعداد سوالات نظرسنجی
     * @return int تعداد سوالات
     */
    public function getQuestionsCountAttribute()
    {
        return $this->questions()->count();
    }

    /**
     * دریافت مجموع امتیازات قابل کسب
     * @return int مجموع امتیازات
     */
    public function getTotalPointsAttribute()
    {
        return $this->questions()->sum('points');
    }

    /**
     * فعال کردن نظرسنجی
     * @return bool
     */
    public function activate()
    {
        $result = $this->update(['is_active' => true]);

        if ($result) {
            ActivityLog::log(
                'survey.activated',
                "نظرسنجی {$this->title} فعال شد",
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
     * غیرفعال کردن نظرسنجی
     * @return bool
     */
    public function deactivate()
    {
        $result = $this->update(['is_active' => false]);

        if ($result) {
            ActivityLog::log(
                'survey.deactivated',
                "نظرسنجی {$this->title} غیرفعال شد",
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
     * دریافت آمار کامل نظرسنجی
     * @return array آمار نظرسنجی
     */
    public function getStatisticsAttribute()
    {
        return [
            'participants_count' => $this->participants_count,
            'questions_count' => $this->questions_count,
            'total_points' => $this->total_points,
            'average_score' => $this->average_score,
            'is_available' => $this->isAvailable(),
            'remaining_time' => $this->remaining_time,
        ];
    }

    /**
     * بررسی آیا نظرسنجی سوال اجباری دارد
     * @return bool
     */
    public function hasRequiredQuestions()
    {
        return $this->questions()->where('is_required', true)->exists();
    }
}
