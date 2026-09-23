<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // در روت‌های ادمین، میدل‌ور role قبلاً چک شده است
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'points_value' => 'required|integer|min:0',
            'model_name' => 'nullable|string',
            'brand' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'تصویر محصول معتبر نیست.',
            'image.max' => 'حجم تصویر محصول نباید بیشتر از ۲ مگابایت باشد.',
        ];
    }
}
