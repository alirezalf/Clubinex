<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PointRule;

class PointRuleSeeder extends Seeder
{
    public function run(): void
    {
        // امتیاز تکمیل پروفایل
        PointRule::firstOrCreate(['action_code' => 'complete_profile'], [
            'points_required' => 0,
            'title' => 'تکمیل پروفایل کاربری',
            'points' => 100,
            'type' => 'one_time',
            'action_code' => 'complete_profile',
            'description' => 'امتیاز تشویقی برای تکمیل اطلاعات حساب کاربری'
        ]);

        // امتیاز ثبت محصول (پیش‌فرض اگر محصول امتیاز خاصی نداشت)
        PointRule::firstOrCreate(['action_code' => 'product_registration_default'], [
            'points_required' => 0,
            'title' => 'ثبت محصول',
            'points' => 50,
            'type' => 'repeatable',
            'action_code' => 'product_registration_default',
            'description' => 'امتیاز پیش‌فرض برای ثبت هر محصول'
        ]);
        
        // امتیاز معرفی دوستان (سطح 1) - عضویت
        PointRule::firstOrCreate(['action_code' => 'referral_level_1'], [
            'points_required' => 0,
            'title' => 'معرفی دوست (عضویت)',
            'points' => 20,
            'type' => 'repeatable',
            'action_code' => 'referral_level_1',
            'description' => 'امتیاز برای هر معرفی موفق که منجر به ثبت نام شود'
        ]);

        // امتیاز معرفی دوستان - خرید محصول (جدید)
        PointRule::firstOrCreate(['action_code' => 'purchase_referral'], [
            'points_required' => 0,
            'title' => 'پاداش خرید معرفی‌شدگان',
            'points' => 30, // امتیاز پیشنهادی
            'type' => 'repeatable',
            'action_code' => 'purchase_referral',
            'description' => 'امتیاز پاداش به معرف، زمانی که زیرمجموعه او خریدی (ثبت محصول) انجام می‌دهد'
        ]);

        // امتیاز بازدید روزانه
        PointRule::firstOrCreate(['action_code' => 'visit_site'], [
            'points_required' => 0,
            'title' => 'بازدید روزانه',
            'points' => 5,
            'type' => 'repeatable',
            'action_code' => 'visit_site',
            'description' => 'امتیاز ورود روزانه به سایت'
        ]);

        // امتیاز شرکت در مسابقه (آزمون)
        PointRule::firstOrCreate(['action_code' => 'quiz_participation'], [
            'points_required' => 0,
            'title' => 'شرکت در مسابقه',
            'points' => 15,
            'type' => 'repeatable',
            'action_code' => 'quiz_participation',
            'description' => 'امتیاز برای شرکت در هر مسابقه'
        ]);

        // امتیاز شرکت در نظرسنجی
        PointRule::firstOrCreate(['action_code' => 'poll_participation'], [
            'points_required' => 0,
            'title' => 'شرکت در نظرسنجی',
            'points' => 10,
            'type' => 'repeatable',
            'action_code' => 'poll_participation',
            'description' => 'امتیاز برای شرکت در هر نظرسنجی'
        ]);

        // پاداش حضور مداوم (ماهانه)
        PointRule::firstOrCreate(['action_code' => 'monthly_streak'], [
            'points_required' => 0,
            'title' => 'پاداش وفاداری ماهانه',
            'points' => 200,
            'type' => 'repeatable', // هر ماه قابل تکرار است
            'action_code' => 'monthly_streak',
            'description' => 'پاداش بازدید مداوم از سایت به مدت ۳۰ روز'
        ]);

        // هدیه تولد
        PointRule::firstOrCreate(['action_code' => 'birthday_gift'], [
            'points_required' => 0,
            'title' => 'هدیه تولد',
            'points' => 500,
            'type' => 'repeatable', // سالانه قابل تکرار است
            'max_per_user' => null, // محدودیت سالانه باید در کد لاجیک چک شود یا max_per_user رو بیخیال بشیم
            'action_code' => 'birthday_gift',
            'description' => 'امتیاز هدیه به مناسبت روز تولد کاربر'
        ]);
        
        // هزینه چرخش گردونه (برای نمایش در قوانین - منطق اصلی در تنظیمات گردونه است)
        PointRule::firstOrCreate(['action_code' => 'lucky_wheel_spin'], [
            'points_required' => 0,
            'title' => 'هزینه چرخش گردونه',
            'points' => -50,
            'type' => 'repeatable',
            'action_code' => 'lucky_wheel_spin',
            'description' => 'مقدار امتیازی که بابت هر بار چرخش گردونه شانس کسر می‌شود (قابل تنظیم در بخش بازی‌سازی)'
        ]);
    }
}