<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')->id;

        return [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($categoryId)],
            'parent_id' => [
                'nullable', 
                'exists:categories,id', 
                function ($attribute, $value, $fail) use ($categoryId) {
                    if ($value == $categoryId) {
                        $fail('دسته نمی‌تواند زیرمجموعه خودش باشد.');
                    }
                }
            ],
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean'
        ];
    }
}