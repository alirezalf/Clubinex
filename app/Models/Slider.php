<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slider extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'location_key',
        'height_class',
        'border_radius',
        'interval',
        'is_active',
        'effect',
        'slides_per_view',
        'loop',
        'direction',
        'border_width',
        'border_color',
        'gap',
        'gap_color'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'loop' => 'boolean',
        'slides_per_view' => 'integer',
        'gap' => 'integer',
    ];

    protected static function booted()
    {
        $clearCache = function ($slider) {
            try {
                cache()->forget('home_main_slider');
                if ($slider->location_key) {
                    cache()->forget("slider_{$slider->location_key}");
                }
            } catch (\Exception $e) {}
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }

    public function slides()
    {
        return $this->hasMany(Slide::class)->orderBy('order');
    }

    public function activeSlides()
    {
        return $this->hasMany(Slide::class)->where('is_active', true)->orderBy('order');
    }
}
