<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LuckyWheel extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'cost_per_spin', 
        'is_active', 'start_at', 'end_at', 'required_club_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function prizes()
    {
        return $this->hasMany(LuckyWheelPrize::class);
    }

    public function spins()
    {
        return $this->hasMany(LuckyWheelSpin::class);
    }

    /**
     * انتخاب جایزه بر اساس شانس
     */
    public function spin(User $user)
    {
        // دریافت جوایز موجود و فعال
        $prizes = $this->prizes()->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('stock')->orWhere('stock', '>', 0);
            })
            ->get();

        if ($prizes->isEmpty()) return null;

        // الگوریتم انتخاب وزنی
        $totalWeight = $prizes->sum('probability');
        $random = rand(1, $totalWeight);
        $currentWeight = 0;
        $selectedPrize = null;

        foreach ($prizes as $prize) {
            $currentWeight += $prize->probability;
            if ($random <= $currentWeight) {
                $selectedPrize = $prize;
                break;
            }
        }

        return $selectedPrize;
    }
}
