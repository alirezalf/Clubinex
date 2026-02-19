<?php

namespace Database\Seeders;

use App\Models\EmailTheme;
use Illuminate\Database\Seeder;

class EmailThemeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. تم رسمی (آبی کلاسیک) - مناسب برای خوش‌آمدگویی و اعلان‌های عمومی
        $officialContent = <<<'HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Tahoma, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; direction: rtl; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: Tahoma, sans-serif; color: #4a4a4a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #0284c7; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
    .content { padding: 40px 30px; line-height: 1.8; font-size: 16px; color: #333333; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
    .logo-text { font-size: 28px; font-weight: 800; color: white; letter-spacing: 1px; }
</style>
</head>
<body>
    <div class="wrapper">
        <br>
        <table class="main-table">
            <tr>
                <td class="header">
                    <div class="logo-text">Clubinex</div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    {content}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    &copy; تمامی حقوق برای کلابینکس محفوظ است.<br>
                    اگر این ایمیل به اشتباه ارسال شده است، آن را نادیده بگیرید.
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
HTML;

        EmailTheme::firstOrCreate(['name' => 'رسمی (آبی)'], [
            'content' => $officialContent,
            'is_active' => true
        ]);

        // 2. تم کد تایید (OTP) - مینیمال و متمرکز بر کد
        $otpContent = <<<'HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Tahoma, sans-serif; background-color: #eef2f6; margin: 0; padding: 0; }
    .card { max-width: 450px; margin: 40px auto; background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
    .icon { font-size: 40px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .text { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
    .code-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #111827; margin: 20px 0; border: 2px dashed #d1d5db; display: inline-block; }
    .footer { font-size: 11px; color: #9ca3af; margin-top: 30px; }
</style>
</head>
<body>
    <div class="card">
        <div class="icon">🔐</div>
        <div class="title">تایید هویت</div>
        <div class="text">برای ورود به حساب کاربری، کد زیر را وارد کنید.</div>
        
        {content}
        
        <div class="footer">این کد تا ۲ دقیقه معتبر است.</div>
    </div>
</body>
</html>
HTML;

        EmailTheme::firstOrCreate(['name' => 'احراز هویت (OTP)'], [
            'content' => $otpContent,
            'is_active' => true
        ]);

        // 3. تم جشن تولد - شاد و رنگارنگ
        $birthdayContent = <<<'HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Tahoma, sans-serif; background-color: #fff1f2; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 4px solid #fecdd3; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #f43f5e, #be123c); color: white; padding: 50px 20px; text-align: center; }
    .emoji { font-size: 60px; margin-bottom: 10px; display: block; animation: bounce 1s infinite; }
    .content { padding: 40px; color: #4b5563; line-height: 1.8; text-align: center; font-size: 18px; }
    .footer { background-color: #fff1f2; padding: 15px; text-align: center; font-size: 12px; color: #e11d48; }
    .gift-box { margin-top: 20px; font-size: 24px; color: #be123c; font-weight: bold; }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="emoji">🎂🎉</span>
            <h1 style="margin:0; font-size:30px;">تولدت مبارک!</h1>
        </div>
        <div class="content">
            {content}
            <div class="gift-box">🎁 هدیه شما در پنل شارژ شد 🎁</div>
        </div>
        <div class="footer">
            با آرزوی بهترین‌ها، تیم کلابینکس ❤️
        </div>
    </div>
</body>
</html>
HTML;

        EmailTheme::firstOrCreate(['name' => 'جشن تولد'], [
            'content' => $birthdayContent,
            'is_active' => true
        ]);

        // 4. تم موفقیت (سبز) - برای ثبت محصول و دریافت جایزه
        $successContent = <<<'HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Tahoma, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
    .container { max-width: 550px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border-top: 5px solid #16a34a; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .content { padding: 40px 30px; text-align: center; color: #374151; }
    .check-icon { display: inline-block; width: 60px; height: 60px; background-color: #dcfce7; color: #16a34a; border-radius: 50%; line-height: 60px; font-size: 30px; margin-bottom: 20px; }
    h2 { margin-top: 0; color: #166534; font-size: 22px; }
    p { line-height: 1.6; font-size: 15px; margin-bottom: 10px; }
    .btn-link { display: inline-block; margin-top: 20px; background-color: #16a34a; color: white; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="check-icon">✓</div>
            {content}
        </div>
        <div class="footer">
            از خرید و اعتماد شما سپاسگزاریم.
        </div>
    </div>
</body>
</html>
HTML;

        EmailTheme::firstOrCreate(['name' => 'عملیات موفق (سبز)'], [
            'content' => $successContent,
            'is_active' => true
        ]);

        // 5. تم پشتیبانی (گفتگو) - برای پاسخ تیکت
        $supportContent = <<<'HTML'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Tahoma, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .email-wrapper { max-width: 600px; margin: 20px auto; background: white; border: 1px solid #e2e8f0; }
    .header-bar { background-color: #334155; padding: 15px 20px; color: white; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-weight: bold; font-size: 16px; }
    .body-content { padding: 30px; color: #334155; font-size: 14px; line-height: 1.7; }
    .ticket-info { background-color: #f1f5f9; padding: 15px; border-right: 3px solid #64748b; margin-bottom: 20px; font-size: 13px; }
    .btn-reply { display: inline-block; background-color: #334155; color: white; padding: 8px 20px; text-decoration: none; border-radius: 4px; font-size: 13px; margin-top: 20px; }
</style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header-bar">
            <span class="brand">پشتیبانی کلابینکس</span>
        </div>
        <div class="body-content">
            <div class="ticket-info">
                این ایمیل در پاسخ به درخواست پشتیبانی شما ارسال شده است.
            </div>
            {content}
            
            <br>
            <center>
                <a href="#" class="btn-reply">مشاهده تیکت در پنل</a>
            </center>
        </div>
    </div>
</body>
</html>
HTML;

        EmailTheme::firstOrCreate(['name' => 'پشتیبانی و تیکت'], [
            'content' => $supportContent,
            'is_active' => true
        ]);
    }
}