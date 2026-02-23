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
        $rules = [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];

        if (\App\Models\SystemSetting::getValue('security', 'captcha_enabled', false)) {
            $rules['captcha'] = ['required', 'captcha'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'captcha.required' => 'لطفا کد امنیتی را وارد کنید.',
            'captcha.captcha' => 'کد امنیتی اشتباه است.',
        ];
    }
}
