<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'mobile' => $this->convertPersianToEnglish($this->mobile),
            'code' => $this->convertPersianToEnglish($this->code),
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
        return [
            'mobile' => 'required|regex:/^09[0-9]{9}$/',
            'code' => 'required|numeric|digits:5'
        ];
    }
}
