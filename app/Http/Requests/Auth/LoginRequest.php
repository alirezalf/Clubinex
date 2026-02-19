<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'captcha' => ['required', 'captcha'],
        ];
    }

    public function messages()
    {
        return [
            'captcha.required' => 'لطفا کد امنیتی را وارد کنید.',
            'captcha.captcha' => 'کد امنیتی اشتباه است.',
        ];
    }
}