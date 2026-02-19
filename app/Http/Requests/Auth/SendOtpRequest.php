<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mobile' => 'required|regex:/^09[0-9]{9}$/',
            'captcha' => 'required|captcha'
        ];
    }

    public function messages()
    {
        return [
            'captcha.required' => 'لطفا کد امنیتی را وارد کنید.',
            'captcha.captcha' => 'کد امنیتی اشتباه است.',
            'mobile.regex' => 'شماره موبایل نامعتبر است.',
        ];
    }
}