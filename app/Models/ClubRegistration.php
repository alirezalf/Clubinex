<?php

namespace App\Models;

use App\Models\PointRule;
use App\Models\ActivityLog;
use Morilog\Jalali\Jalalian;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClubRegistration extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',        // کاربر درخواست‌دهنده
        'club_id',        // باشگاه مورد درخواست
        'requested_at',   // زمان درخواست
        'approved_at',    // زمان تأیید
        'status',         // وضعیت درخواست
        'approved_by',    // مدیر تأییدکننده
        'notes',          // یادداشت‌های مدیر
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'requested_at' => 'datetime',  // تبدیل به تاریخ
        'approved_at' => 'datetime',   // تبدیل به تاریخ
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با کاربر
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * رابطه چند به یک با باشگاه
     */
    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * رابطه چند به یک با مدیر تأییدکننده
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای درخواست‌های در انتظار تأیید
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * اسکوپ برای درخواست‌های تأیید شده
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * اسکوپ برای درخواست‌های رد شده
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * اسکوپ برای درخواست‌های اخیر
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('requested_at', 'desc');
    }

    /**
     * اسکوپ برای درخواست‌های ارتقای سطح
     */
    public function scopeUpgradeRequests($query)
    {
        return $query->whereHas('user', function($q) {
            $q->whereColumn('users.club_id', '<>', 'club_registrations.club_id');
        });
    }

    /**
     * اسکوپ برای درخواست‌های عضویت اولیه
     */
    public function scopeInitialRequests($query)
    {
        return $query->whereHas('user', function($q) {
            $q->whereNull('users.club_id');
        });
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا درخواست در انتظار تأیید است
     * @return bool
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * بررسی آیا درخواست تأیید شده است
     * @return bool
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * بررسی آیا درخواست رد شده است
     * @return bool
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * دریافت زمان درخواست به شمسی
     * @return string تاریخ شمسی
     */
    public function getRequestedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->requested_at)->format('Y/m/d H:i');
    }

    /**
     * دریافت زمان تأیید به شمسی
     * @return string|null تاریخ شمسی یا null
     */
    public function getApprovedAtJalaliAttribute()
    {
        return $this->approved_at ? Jalalian::fromDateTime($this->approved_at)->format('Y/m/d H:i') : null;
    }

    /**
     * محاسبه زمان بررسی درخواست
     * @return int|null زمان بر حسب ساعت یا null
     */
    public function getProcessingTimeAttribute()
    {
        if ($this->approved_at) {
            return $this->requested_at->diffInHours($this->approved_at);
        }
        return null;
    }

    /**
     * بررسی آیا این درخواست برای ارتقای سطح است
     * @return bool
     */
    public function isUpgradeRequest()
    {
        return $this->user->club_id && $this->user->club_id != $this->club_id;
    }

    /**
     * بررسی آیا این درخواست برای عضویت اولیه است
     * @return bool
     */
    public function isInitialRequest()
    {
        return is_null($this->user->club_id);
    }

    /**
     * تأیید درخواست عضویت
     * @param int $adminId شناسه مدیر تأییدکننده
     * @param string|null $notes یادداشت اضافی
     * @return bool
     */
    public function approve($adminId, $notes = null)
    {
        // شروع تراکنش دیتابیس
        DB::beginTransaction();

        try {
            // به‌روزرسانی وضعیت درخواست
            $this->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $adminId,
                'notes' => $notes ?: $this->notes,
            ]);

            // به‌روزرسانی باشگاه کاربر
            $this->user->update(['club_id' => $this->club_id]);

            // ثبت تراکنش امتیاز برای عضویت
            $pointRule = PointRule::where('action_code', 'club_registration')->first();
            if ($pointRule) {
                PointTransaction::create([
                    'user_id' => $this->user_id,
                    'type' => 'earn',
                    'amount' => $pointRule->points,
                    'point_rule_id' => $pointRule->id,
                    'reference_type' => self::class,
                    'reference_id' => $this->id,
                    'description' => "عضویت در باشگاه {$this->club->name}",
                    'balance_after' => $this->user->current_points + $pointRule->points,
                ]);
            }

            // ثبت لاگ فعالیت
            ActivityLog::log(
                'club.registration_approved',
                "عضویت کاربر {$this->user->mobile} در باشگاه {$this->club->name} تأیید شد",
                [
                    'user_id' => $this->user_id,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['status' => 'pending', 'club_id' => $this->user->getOriginal('club_id')],
                    'new_values' => ['status' => 'approved', 'club_id' => $this->club_id],
                ]
            );

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }

    /**
     * رد درخواست عضویت
     * @param int $adminId شناسه مدیر
     * @param string $reason دلیل رد درخواست
     * @return bool
     */
    public function reject($adminId, $reason)
    {
        $result = $this->update([
            'status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => $adminId,
            'notes' => $reason . "\n\n" . ($this->notes ?? ''),
        ]);

        if ($result) {
            ActivityLog::log(
                'club.registration_rejected',
                "درخواست عضویت کاربر {$this->user->mobile} در باشگاه {$this->club->name} رد شد. دلیل: {$reason}",
                [
                    'user_id' => $this->user_id,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['status' => 'pending'],
                    'new_values' => ['status' => 'rejected'],
                ]
            );
        }

        return $result;
    }

    /**
     * بررسی امکان تأیید خودکار
     * @return bool
     */
    public function canAutoApprove()
    {
        // اگر باشگاه نیاز به تأیید دستی نداشته باشد و کاربر شرایط را داشته باشد
        if (!$this->club->upgrade_required && $this->user->current_points >= $this->club->min_points) {
            return true;
        }
        return false;
    }

    /**
     * دریافت اطلاعات کامل برای نمایش
     * @return array
     */
    public function getDisplayInfoAttribute()
    {
        return [
            'user_name' => $this->user->full_name,
            'user_mobile' => $this->user->mobile,
            'club_name' => $this->club->name,
            'request_date' => $this->getRequestedAtJalaliAttribute(),
            'status_text' => $this->getStatusText(),
            'processing_time' => $this->processing_time,
            'notes' => $this->notes,
        ];
    }

    /**
     * دریافت متن وضعیت
     * @return string
     */
    public function getStatusText()
    {
        $statuses = [
            'pending' => 'در انتظار تأیید',
            'approved' => 'تأیید شده',
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
            'approved' => 'success',
            'rejected' => 'danger',
        ];

        return $colors[$this->status] ?? 'secondary';
    }
}