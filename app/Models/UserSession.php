<?php

namespace App\Models;

use Morilog\Jalali\Jalalian;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserSession extends Model
{
    use HasFactory;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',              // کاربر
        'session_type',         // نوع جلسه
        'page_url',             // آدرس صفحه
        'started_at',           // زمان شروع
        'ended_at',             // زمان پایان
        'duration_seconds',     // مدت بازدید
        'ip_address',           // آی‌پی کاربر
        'user_agent',           // اطلاعات مرورگر
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
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
     * اسکوپ برای جلسات فعال
     */
    public function scopeActive($query)
    {
        return $query->whereNull('ended_at');
    }

    /**
     * اسکوپ برای جلسات گذشته
     */
    public function scopeInactive($query)
    {
        return $query->whereNotNull('ended_at');
    }

    /**
     * اسکوپ برای جلسات نوع خاص
     */
    public function scopeType($query, $type)
    {
        return $query->where('session_type', $type);
    }

    /**
     * اسکوپ برای جلسات کاربر خاص
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * اسکوپ برای جلسات در بازه زمانی
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('started_at', [$startDate, $endDate]);
    }

    /**
     * اسکوپ برای جلسات با مدت زمان خاص
     */
    public function scopeLongSessions($query, $minSeconds = 300)
    {
        return $query->where('duration_seconds', '>=', $minSeconds);
    }

    /**
     * اسکوپ برای جلسات کوتاه
     */
    public function scopeShortSessions($query, $maxSeconds = 60)
    {
        return $query->where('duration_seconds', '<=', $maxSeconds);
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا جلسه فعال است
     */
    public function isActive()
    {
        return is_null($this->ended_at);
    }

    /**
     * دریافت مدت زمان فرمت شده
     */
    public function getDurationFormattedAttribute()
    {
        if ($this->duration_seconds < 60) {
            return "{$this->duration_seconds} ثانیه";
        } elseif ($this->duration_seconds < 3600) {
            $minutes = floor($this->duration_seconds / 60);
            $seconds = $this->duration_seconds % 60;
            return "{$minutes} دقیقه {$seconds} ثانیه";
        } else {
            $hours = floor($this->duration_seconds / 3600);
            $minutes = floor(($this->duration_seconds % 3600) / 60);
            return "{$hours} ساعت {$minutes} دقیقه";
        }
    }

    /**
     * دریافت زمان شروع به شمسی
     */
    public function getStartedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->started_at)->format('Y/m/d H:i');
    }

    /**
     * دریافت زمان پایان به شمسی
     */
    public function getEndedAtJalaliAttribute()
    {
        return $this->ended_at ? Jalalian::fromDateTime($this->ended_at)->format('Y/m/d H:i') : null;
    }

    /**
     * دریافت نام صفحه از URL
     */
    public function getPageNameAttribute()
    {
        $url = parse_url($this->page_url);
        $path = $url['path'] ?? '/';

        $pages = [
            '/' => 'صفحه اصلی',
            '/dashboard' => 'داشبورد',
            '/club' => 'باشگاه',
            '/surveys' => 'نظرسنجی‌ها',
            '/points' => 'امتیازات',
            '/referrals' => 'معرفی دوستان',
            '/profile' => 'پروفایل',
        ];

        return $pages[$path] ?? $path;
    }

    /**
     * دریافت نوع جلسه به فارسی
     */
    public function getSessionTypeFarsiAttribute()
    {
        $types = [
            'club_visit' => 'بازدید باشگاه',
            'dashboard' => 'داشبورد',
            'product_view' => 'مشاهده محصول',
        ];

        return $types[$this->session_type] ?? $this->session_type;
    }

    /**
     * شروع جلسه جدید
     */
    public static function startSession($userId, $sessionType, $pageUrl)
    {
        $session = self::create([
            'user_id' => $userId,
            'session_type' => $sessionType,
            'page_url' => $pageUrl,
            'started_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $session;
    }

    /**
     * پایان دادن به جلسه
     */
    public function endSession()
    {
        if ($this->isActive()) {
            $endedAt = now();
            $duration = $this->started_at->diffInSeconds($endedAt);

            $this->update([
                'ended_at' => $endedAt,
                'duration_seconds' => $duration,
            ]);

            // ثبت لاگ فعالیت
            ActivityLog::log(
                'user.session_end',
                "جلسه کاربری با مدت {$this->duration_formatted} پایان یافت",
                [
                    'user_id' => $this->user_id,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                ]
            );

            return true;
        }

        return false;
    }

    /**
     * به‌روزرسانی مدت جلسه فعال
     */
    public static function updateActiveSessions()
    {
        $activeSessions = self::active()->get();

        foreach ($activeSessions as $session) {
            $duration = $session->started_at->diffInSeconds(now());

            // اگر جلسه بیش از 4 ساعت فعال بوده، آن را پایان دهیم
            if ($duration > 14400) {
                $session->endSession();
            }
        }
    }

    /**
     * دریافت آمار جلسات کاربر
     */
    public static function getUserSessionsStats($userId)
    {
        $stats = [
            'total_sessions' => self::byUser($userId)->count(),
            'active_sessions' => self::byUser($userId)->active()->count(),
            'total_duration' => self::byUser($userId)->sum('duration_seconds'),
            'avg_duration' => self::byUser($userId)->avg('duration_seconds'),
            'by_type' => self::byUser($userId)
                ->selectRaw('session_type, count(*) as count, avg(duration_seconds) as avg_duration')
                ->groupBy('session_type')
                ->get()
                ->pluck('avg_duration', 'session_type')
                ->toArray(),
            'recent_pages' => self::byUser($userId)
                ->orderBy('started_at', 'desc')
                ->limit(10)
                ->pluck('page_url')
                ->toArray(),
        ];

        return $stats;
    }

    /**
     * پاک‌سازی جلسات قدیمی
     */
    public static function cleanOldSessions($days = 30)
    {
        $date = now()->subDays($days);
        return self::where('started_at', '<', $date)->delete();
    }

    /**
     * تشخیص دستگاه از user_agent
     */
    public function getDeviceInfoAttribute()
    {
        $agent = $this->user_agent;

        if (strpos($agent, 'Mobile') !== false) {
            $device = 'موبایل';
        } elseif (strpos($agent, 'Tablet') !== false) {
            $device = 'تبلت';
        } else {
            $device = 'کامپیوتر';
        }

        // تشخیص مرورگر
        if (strpos($agent, 'Chrome') !== false) {
            $browser = 'Chrome';
        } elseif (strpos($agent, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($agent, 'Safari') !== false) {
            $browser = 'Safari';
        } else {
            $browser = 'ناشناس';
        }

        return [
            'device' => $device,
            'browser' => $browser,
        ];
    }

    /**
     * بررسی تعداد جلسات همزمان کاربر
     */
    public static function hasTooManySessions($userId, $maxSessions = 5)
    {
        $activeSessions = self::byUser($userId)->active()->count();
        return $activeSessions >= $maxSessions;
    }
}