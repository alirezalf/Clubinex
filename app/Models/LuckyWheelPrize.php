<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class LuckyWheelPrize extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lucky_wheel_id', 'title', 'icon', 'color', 'text_color', 'font_size', 'text_orientation',
        'type', 'value', 'probability', 'stock', 'is_active'
    ];

    public function wheel()
    {
        return $this->belongsTo(LuckyWheel::class);
    }
}
