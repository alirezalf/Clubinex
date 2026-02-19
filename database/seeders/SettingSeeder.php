<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\SystemSetting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // تنظیمات عمومی و سئو
            ['group' => 'general', 'key' => 'site_title', 'value' => 'باشگاه مشتریان کلابینکس', 'type' => 'string', 'is_public' => true, 'label' => 'عنوان سایت'],
            ['group' => 'general', 'key' => 'site_description', 'value' => 'بهترین پلتفرم وفاداری مشتریان', 'type' => 'string', 'is_public' => true, 'label' => 'توضیحات سایت'],
            ['group' => 'seo', 'key' => 'meta_keywords', 'value' => 'باشگاه مشتریان, وفاداری, تخفیف, جایزه', 'type' => 'string', 'is_public' => true, 'label' => 'کلمات کلیدی متا'],
            ['group' => 'seo', 'key' => 'og_image', 'value' => '', 'type' => 'string', 'is_public' => true, 'label' => 'تصویر اشتراک‌گذاری (SEO)'], // اضافه شده
            ['group' => 'general', 'key' => 'footer_text', 'value' => 'تمامی حقوق محفوظ است.', 'type' => 'string', 'is_public' => true, 'label' => 'متن فوتر'],

            // اطلاعات تماس
            ['group' => 'contact', 'key' => 'admin_mobile', 'value' => '09196600545', 'type' => 'string', 'is_public' => true, 'label' => 'شماره موبایل مدیر'],
            ['group' => 'contact', 'key' => 'support_email', 'value' => 'support@clubinex.com', 'type' => 'string', 'is_public' => true, 'label' => 'ایمیل پشتیبانی'],
            ['group' => 'contact', 'key' => 'address', 'value' => 'تهران، میدان ونک، خیابان ولیعصر', 'type' => 'string', 'is_public' => true, 'label' => 'آدرس'],

            // شبکه‌های اجتماعی
            ['group' => 'social', 'key' => 'instagram', 'value' => 'https://instagram.com/clubinex', 'type' => 'string', 'is_public' => true, 'label' => 'اینستاگرام'],
            ['group' => 'social', 'key' => 'telegram', 'value' => 'https://t.me/clubinex', 'type' => 'string', 'is_public' => true, 'label' => 'تلگرام'],
            ['group' => 'social', 'key' => 'whatsapp', 'value' => 'https://wa.me/989123456789', 'type' => 'string', 'is_public' => true, 'label' => 'واتساپ'],
            ['group' => 'social', 'key' => 'linkedin', 'value' => 'https://linkedin.com/in/clubinex', 'type' => 'string', 'is_public' => true, 'label' => 'لینکدین'],

            // تنظیمات ظاهری (تم)
            ['group' => 'theme', 'key' => 'primary_color', 'value' => '#0284c7', 'type' => 'string', 'is_public' => true, 'label' => 'رنگ اصلی'], 
            ['group' => 'theme', 'key' => 'radius_size', 'value' => '0.75rem', 'type' => 'string', 'is_public' => true, 'label' => 'اندازه گردی گوشه‌ها'],
            ['group' => 'theme', 'key' => 'logo_url', 'value' => '', 'type' => 'string', 'is_public' => true, 'label' => 'لوگو'],
            ['group' => 'theme', 'key' => 'favicon_url', 'value' => '', 'type' => 'string', 'is_public' => true, 'label' => 'فاوآیکون'],
            ['group' => 'theme', 'key' => 'sidebar_collapsed', 'value' => false, 'type' => 'boolean', 'is_public' => true, 'label' => 'منوی کناری بصورت پیش‌فرض بسته باشد'],

            // تنظیمات امنیتی (جدید)
            ['group' => 'security', 'key' => 'max_login_attempts', 'value' => 5, 'type' => 'number', 'is_public' => false, 'label' => 'حداکثر تلاش ورود'],
            ['group' => 'security', 'key' => 'lockout_time', 'value' => 60, 'type' => 'number', 'is_public' => false, 'label' => 'زمان مسدودی (دقیقه)'],
            ['group' => 'security', 'key' => 'session_timeout', 'value' => 30, 'type' => 'number', 'is_public' => true, 'label' => 'تایم‌اوت نشست'],
            ['group' => 'security', 'key' => 'captcha_enabled', 'value' => false, 'type' => 'boolean', 'is_public' => true, 'label' => 'کپچا فعال باشد'],

            // تنظیمات باشگاه
            ['group' => 'club', 'key' => 'registration_points', 'value' => '50', 'type' => 'number', 'is_public' => false, 'label' => 'امتیاز ثبت نام'],
            ['group' => 'club', 'key' => 'referral_points', 'value' => '20', 'type' => 'number', 'is_public' => false, 'label' => 'امتیاز معرفی'],
            ['group' => 'club', 'key' => 'daily_point_limit', 'value' => '1000', 'type' => 'number', 'is_public' => false, 'label' => 'سقف امتیاز روزانه'],
            ['group' => 'finance', 'key' => 'currency', 'value' => 'تومان', 'type' => 'string', 'is_public' => true, 'label' => 'واحد پول'],
            
            // تنظیمات پیامک
            ['group' => 'sms', 'key' => 'sms_provider', 'value' => 'kavenegar', 'type' => 'string', 'is_public' => false, 'label' => 'سرویس دهنده پیامک'],
            ['group' => 'sms', 'key' => 'sms_api_key', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'کلید API پیامک'],
            ['group' => 'sms', 'key' => 'sms_username', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'نام کاربری پنل پیامک'],
            ['group' => 'sms', 'key' => 'sms_password', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'رمز عبور پنل پیامک'],
            ['group' => 'sms', 'key' => 'sms_sender', 'value' => '10002000', 'type' => 'string', 'is_public' => false, 'label' => 'شماره فرستنده پیامک'],

            // تنظیمات اتصال به وردپرس
            ['group' => 'wordpress', 'key' => 'wp_url', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'آدرس سایت وردپرس'],
            ['group' => 'wordpress', 'key' => 'wp_consumer_key', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'Consumer Key (WooCommerce)'],
            ['group' => 'wordpress', 'key' => 'wp_consumer_secret', 'value' => '', 'type' => 'string', 'is_public' => false, 'label' => 'Consumer Secret (WooCommerce)'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                $setting
            );
        }
    }
}