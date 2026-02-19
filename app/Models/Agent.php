<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\Agent\HasAgentLogic;

class Agent extends Model
{
    use HasFactory, SoftDeletes;
    use HasAgentLogic; // استفاده از تریت منطق‌های ایجنت

    protected $fillable = [
        'user_id',
        'agent_code',
        'store_name',
        'area',
        'max_clients',
        'commission_rate',
        'is_active',
        'verified_at',
    ];

    protected $casts = [
        'max_clients' => 'integer',
        'commission_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
    ];

    // ==================== روابط ====================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function clients()
    {
        return $this->hasMany(User::class, 'agent_id');
    }

    public function activities()
    {
        return $this->hasMany(ActivityLog::class, 'admin_id')
            ->where('action_group', 'referral');
    }

    // ==================== اسکوپ‌ها ====================
    // اسکوپ‌ها چون مستقیماً با کوئری بیلدر کار می‌کنند در مدل اصلی می‌مانند

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }

    public function scopeByArea($query, $area)
    {
        return $query->where('area', $area);
    }

    public function scopeWithAvailableSlots($query)
    {
        return $query->where(function($q) {
            $q->whereNull('max_clients')
              ->orWhereRaw('(SELECT COUNT(*) FROM users WHERE agent_id = agents.id) < max_clients');
        });
    }
}
