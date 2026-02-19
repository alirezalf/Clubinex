<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class RewardRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'reward_id',
        'lucky_wheel_spin_id', // اضافه شده
        'points_spent', 
        'status', 
        'admin_note', 
        'delivery_info', 
        'tracking_code',
        'admin_id'
    ];

    protected $casts = [
        'delivery_info' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }

    /**
     * رابطه با چرخش گردونه (برای جوایزی که از گردونه آمده‌اند)
     */
    public function spin()
    {
        return $this->belongsTo(LuckyWheelSpin::class, 'lucky_wheel_spin_id');
    }

    // رابطه با کاربری که وضعیت را تغییر داده (ادمین)
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function getStatusFarsiAttribute()
    {
        return match($this->status) {
            'pending' => 'در انتظار بررسی',
            'processing' => 'در حال آماده‌سازی',
            'completed' => 'تکمیل شده/ارسال شده',
            'rejected' => 'رد شده',
            default => $this->status,
        };
    }
    
    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }
}