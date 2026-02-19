<?php

namespace App\Models;

use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

// Import Custom Traits
use App\Models\Traits\User\HasProfileLogic;
use App\Models\Traits\User\HasAuthLogic;
use App\Models\Traits\User\HasGamificationLogic;
use App\Models\Traits\User\HasSystemRelations;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles, TwoFactorAuthenticatable;
    
    // Include split logic traits
    use HasProfileLogic, HasAuthLogic, HasGamificationLogic, HasSystemRelations;

    protected $fillable = [
        'mobile', 'otp', 'otp_verified_at',
        'username', 'password', 'password_set_at', 'current_points',
        'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at', 'email_verified_at',
        'profile_completed',
        'first_name', 'last_name', 'national_code', 'birth_date', 'gender',
        'marital_status', 'job', 
        'province_id', 'city_id',
        'postal_code', 'address',
        'email', 'avatar',
        'status_id', 'club_id', 'referral_code', 'referred_by', 'agent_id',
        'last_login_at', 'remember_token',
        'theme_preferences', 
        'dashboard_preferences', 
    ];

    protected $hidden = [
        'otp', 'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected $casts = [
        'otp_verified_at' => 'datetime',
        'password_set_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'birth_date' => 'date',
        'profile_completed' => 'boolean',
        'last_login_at' => 'datetime',
        'current_points' => 'integer',
        'theme_preferences' => 'array',     // حیاتی: تبدیل خودکار JSON به آرایه
        'dashboard_preferences' => 'array', // حیاتی: تبدیل خودکار JSON به آرایه
    ];

    // --- Global Scopes ---

    public function scopeActive($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('slug', 'active');
        });
    }

    public function scopeProfileCompleted($query)
    {
        return $query->where('profile_completed', true);
    }

    public function scopeByMobile($query, $mobile)
    {
        return $query->where('mobile', $mobile);
    }

    public function scopeByClub($query, $clubId)
    {
        return $query->where('club_id', $clubId);
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }
}
