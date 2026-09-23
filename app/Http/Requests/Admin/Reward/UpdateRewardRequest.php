<?php

namespace App\Http\Requests\Admin\Reward;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'points_cost' => 'required|integer|min:1',
            'cash_cost' => 'nullable|numeric|min:0',
            'type' => 'required|in:digital,physical,charge,discount_code',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'limit_per_user' => 'nullable|integer|min:1',
            'valid_until' => 'nullable|date',
            'delivery_instructions' => 'nullable|string',
            'required_club_id' => 'nullable|exists:clubs,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'تصویر جایزه معتبر نیست.',
            'image.max' => 'حجم تصویر جایزه نباید بیشتر از ۲ مگابایت باشد.',
        ];
    }
}
