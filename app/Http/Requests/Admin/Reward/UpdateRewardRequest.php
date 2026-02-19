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
            'type' => 'required|in:digital,physical,charge,discount_code',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'required_club_id' => 'nullable|exists:clubs,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean'
        ];
    }
}