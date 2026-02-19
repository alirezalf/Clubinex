<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class NotificationBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id', 'title', 'message', 'target_type', 'target_id', 'recipient_ids', 'channels', 'recipient_count'
    ];

    protected $casts = [
        'channels' => 'array',
        'recipient_ids' => 'array',
        'recipient_count' => 'integer'
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetClub()
    {
        return $this->belongsTo(Club::class, 'target_id');
    }

    // متد کمکی برای دریافت اطلاعات کاربران در صورت انتخاب دستی
    public function getRecipients()
    {
        if ($this->target_type === 'manual' && !empty($this->recipient_ids)) {
            return User::whereIn('id', $this->recipient_ids)->select('id', 'first_name', 'last_name', 'mobile')->get();
        }
        return collect();
    }

    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }

    public function getTargetLabelAttribute()
    {
        if ($this->target_type === 'all') return 'همه کاربران';
        if ($this->target_type === 'club') return 'باشگاه: ' . ($this->targetClub->name ?? 'حذف شده');
        if ($this->target_type === 'manual') return 'انتخاب دستی (' . $this->recipient_count . ' نفر)';
        return $this->target_type;
    }
}