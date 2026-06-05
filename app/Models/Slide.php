<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slide extends Model
{
    use HasFactory;

    protected $fillable = [
        'slider_id', 'image_path', 'bg_text', 'bg_color',
        'title', 'description',
        'button_text', 'button_link',

        // Positioning
        'content_position',
        'btn_relative_pos',
        'btn_pos_type',
        'btn_custom_pos',

        // Styling
        'text_color',
        'text_size',
        'desc_color', // Added
        'desc_size',  // Added
        'gap_y',      // Added
        'button_color',
        'button_bg_color',
        'button_size',

        // Animations
        'anim_speed',
        'text_anim_in',
        'text_anim_out',
        'btn_anim_in',
        'btn_anim_out',

        // Legacy
        'text_position',
        'animation_type',

        'order', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'gap_y' => 'integer',
    ];

    protected static function booted()
    {
        $clearCache = function ($slide) {
            try {
                cache()->forget('home_main_slider');
                $slider = $slide->slider;
                if ($slider && $slider->location_key) {
                    cache()->forget("slider_{$slider->location_key}");
                }
            } catch (\Exception $e) {}
        };

        static::saved($clearCache);
        static::deleted($clearCache);
    }

    public function slider()
    {
        return $this->belongsTo(Slider::class);
    }
}
