<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LuckyWheelPrize extends Model
{
    use HasFactory;

    protected $fillable = [
        'lucky_wheel_id', 'title', 'icon', 'color', 
        'type', 'value', 'probability', 'stock', 'is_active'
    ];

    public function wheel()
    {
        return $this->belongsTo(LuckyWheel::class);
    }
}
