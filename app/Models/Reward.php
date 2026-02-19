<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reward extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'description', 'image', 'points_cost', 
        'type', 'delivery_instructions', 'stock', 
        'limit_per_user', 'is_active', 'required_club_id', 'valid_until'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'valid_until' => 'datetime',
        'points_cost' => 'integer',
        'stock' => 'integer',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class, 'required_club_id');
    }

    public function redemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }

    /**
     * بررسی اینکه آیا کاربر مجاز به دریافت این جایزه است
     */
    public function canUserRedeem(User $user)
    {
        if (!$this->is_active) return false;
        if ($this->stock <= 0) return false;
        if ($user->current_points < $this->points_cost) return false;
        
        // بررسی سطح باشگاه
        if ($this->required_club_id && (!$user->club_id || $user->club->min_points < $this->club->min_points)) {
            return false;
        }

        // بررسی محدودیت تعداد برای کاربر
        if ($this->limit_per_user) {
            $userRedemptions = $this->redemptions()->where('user_id', $user->id)->count();
            if ($userRedemptions >= $this->limit_per_user) return false;
        }

        return true;
    }
}
