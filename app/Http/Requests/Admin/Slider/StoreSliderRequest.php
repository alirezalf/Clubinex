<?php

namespace App\Http\Requests\Admin\Slider;

use Illuminate\Foundation\Http\FormRequest;

class StoreSliderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'location_key' => 'required|string|unique:sliders,location_key',
            'height_class' => 'required|string',
            'interval' => 'required|integer|min:1000',
            'effect' => 'nullable|string',
            'slides_per_view' => 'nullable|integer|min:1',
            'border_radius' => 'nullable|string',
            'loop' => 'boolean',
            'direction' => 'nullable|in:ltr,rtl',
            'border_width' => 'nullable|string',
            'border_color' => 'nullable|string',
            'gap' => 'nullable|integer|min:0',
            'gap_color' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}