<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'mobile' => ['required', 'string', 'regex:/^09[0-9]{9}$/', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'captcha' => ['required', 'captcha'],
            'referral_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages()
    {
        return [
            'captcha.required' => 'لطفا کد امنیتی را وارد کنید.',
            'captcha.captcha' => 'کد امنیتی اشتباه است.',
            'mobile.regex' => 'فرمت شماره موبایل صحیح نیست.',
            'mobile.unique' => 'این شماره موبایل قبلاً ثبت شده است.',
        ];
    }
}