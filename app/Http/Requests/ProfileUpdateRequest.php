<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'national_code' => ['nullable', 'digits:10', Rule::unique(User::class)->ignore($this->user()->id)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'job' => ['nullable', 'string', 'max:100'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'city_id' => [
                'nullable',
                Rule::exists('cities', 'id')->where(fn ($query) =>
                    $this->filled('province_id')
                        ? $query->where('province_id', $this->input('province_id'))
                        : $query
                ),
            ],
            'postal_code' => ['nullable', 'digits_between:5,10'],
            'address' => ['nullable', 'string', 'max:500'],
            'avatar' => ['nullable', 'image', 'max:5120'], // 5MB
            
            // فیلدهای مربوط به نماینده
            'is_agent' => ['boolean'],
            'agent_code' => ['nullable', 'string', 'max:20', 'required_if:is_agent,true'],
            'store_name' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.image' => 'فایل انتخاب‌شده برای تصویر پروفایل معتبر نیست. فقط JPG، PNG، WEBP یا GIF انتخاب کنید.',
            'avatar.max' => 'حجم تصویر پروفایل نباید بیشتر از ۵ مگابایت باشد.',
        ];
    }
}
