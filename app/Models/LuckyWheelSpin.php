<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class LuckyWheelSpin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'lucky_wheel_id', 'prize_id', 
        'cost_paid', 'is_win'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function prize()
    {
        return $this->belongsTo(LuckyWheelPrize::class);
    }

    /**
     * رابطه با درخواست جایزه (اگر جایزه فیزیکی باشد)
     */
    public function redemption()
    {
        return $this->hasOne(RewardRedemption::class, 'lucky_wheel_spin_id');
    }
    
    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }
}