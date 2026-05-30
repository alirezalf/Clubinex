<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'mobile' => $this->convertPersianToEnglish($this->mobile),
        ]);
    }

    private function convertPersianToEnglish($string)
    {
        if (empty($string)) return $string;
        $persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        $english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $string = str_replace($persian, $english, $string);
        return str_replace($arabic, $english, $string);
    }

    public function rules(): array
    {
        $rules = [
            'mobile' => 'required|regex:/^09[0-9]{9}$/',
            'referral_code' => 'nullable|string|max:50',
        ];

        if (\App\Models\SystemSetting::getValue('security', 'captcha_enabled', false)) {
            $rules['captcha'] = 'required|captcha';
        }

        return $rules;
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
