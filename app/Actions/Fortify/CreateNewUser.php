<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\ReferralNetwork;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'mobile' => [
                'required',
                'string',
                'regex:/^09[0-9]{9}$/',
                Rule::unique(User::class)
            ],
            'password' => $this->passwordRules(),
            'referral_code' => [
                'nullable',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        // Check if referral code matches a user's code OR mobile number
                        $exists = User::where('referral_code', $value)
                            ->orWhere('mobile', $value)
                            ->exists();

                        if (!$exists) {
                            $fail('کد معرف یا شماره موبایل وارد شده معتبر نیست.');
                        }
                    }
                },
            ],
        ])->validate();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'email' => $input['email'],
            'mobile' => $input['mobile'],
            'password' => Hash::make($input['password']),
            'status_id' => 1, // Active
            // تولید خودکار کد ریفرال برای خود کاربر جدید هنگام ثبت نام
            'referral_code' => strtoupper(substr(md5($input['mobile'] . time()), 0, 8)),
        ]);

        // اختصاص نقش پیش‌فرض
        $user->assignRole('user');

        // پردازش کد معرف (Referral System)
        if (!empty($input['referral_code'])) {
            $referrer = User::where('referral_code', $input['referral_code'])
                           ->orWhere('mobile', $input['referral_code']) // پشتیبانی از شماره موبایل به عنوان کد معرف
                           ->first();

            if ($referrer && $referrer->id !== $user->id) {
                // ثبت کاربر جدید به عنوان زیرمجموعه معرف
                // متد createReferral قبلاً در مدل ReferralNetwork تعریف شده و سطوح را مدیریت می‌کند
                ReferralNetwork::createReferral($referrer->id, $user->id);

                // به‌روزرسانی فیلد referred_by در جدول user برای دسترسی سریع
                $user->update(['referred_by' => $referrer->id]);
            }
        }

        return $user;
    }
}