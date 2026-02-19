<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force Sync Queue in Local Environment
        if (app()->isLocal()) {
            config(['queue.default' => 'sync']);
        }

        try {
            // جلوگیری از خطا در هنگام اجرای مایگریشن اولیه یا عدم وجود دیتابیس
            if (!Schema::hasTable('system_settings')) {
                return;
            }

            // کش کردن تنظیمات برای جلوگیری از کوئری تکراری در هر درخواست
            $settings = cache()->remember('global_settings', 3600, function () {
                return SystemSetting::getSettingsArray();
            });

            // مدیریت رنگ‌ها
            $primaryColor = $settings['theme.primary_color'] ?? '#0284c7';
            if (!str_starts_with($primaryColor, '#')) {
                $primaryColor = '#' . $primaryColor;
            }
            
            // تبدیل به RGB برای استفاده در CSS Variables
            // مقادیر پیش‌فرض در صورت خطا
            $r = 2; $g = 132; $b = 199; 
            
            try {
                if (preg_match('/^#([a-f0-9]{6})$/i', $primaryColor)) {
                    list($r, $g, $b) = sscanf($primaryColor, "#%02x%02x%02x");
                }
            } catch (\Exception $e) {
                // رنگ پیش‌فرض در صورت فرمت نامعتبر
            }

            $themeData = [
                'primary_color' => $primaryColor,
                'primary_rgb' => "$r $g $b", // ارسال مقدار RGB محاسبه شده
                'radius_size' => $settings['theme.radius_size'] ?? '0.75rem',
                'sidebar_bg' => $settings['theme.sidebar_bg'] ?? '#ffffff',
                'sidebar_text' => $settings['theme.sidebar_text'] ?? '#1f2937',
                'sidebar_texture' => $settings['theme.sidebar_texture'] ?? 'none',
                'header_bg' => $settings['theme.header_bg'] ?? 'rgba(255,255,255,0.8)',
                'sidebar_collapsed' => filter_var($settings['theme.sidebar_collapsed'] ?? false, FILTER_VALIDATE_BOOLEAN), 
            ];

            // اشتراک‌گذاری تنظیمات مهم با ویوی اصلی بلید (برای CSS Variables اولیه)
            View::share('themeSettings', $themeData);

            // اشتراک‌گذاری اطلاعات عمومی سایت با Inertia (برای استفاده در کامپوننت‌های React)
            Inertia::share([
                'themeSettings' => $themeData, // ارسال تنظیمات تم به ری‌اکت
                'site' => [
                    'name' => $settings['general.site_title'] ?? 'Clubinex',
                    'description' => $settings['general.site_description'] ?? '',
                    'logo' => $settings['theme.logo_url'] ?? null,
                    'favicon' => $settings['theme.favicon_url'] ?? null,
                    'socials' => [
                        'instagram' => $settings['social.instagram'] ?? null,
                        'telegram' => $settings['social.telegram'] ?? null,
                        'whatsapp' => $settings['social.whatsapp'] ?? null,
                        'linkedin' => $settings['social.linkedin'] ?? null,
                    ],
                    'contact' => [
                        'phone' => $settings['contact.admin_mobile'] ?? '',
                        'email' => $settings['contact.support_email'] ?? '',
                        'address' => $settings['contact.address'] ?? '',
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            // در صورت خطای دیتابیس، مقادیر پیش‌فرض را ست می‌کنیم تا بیلد شکست نخورد
            $defaultTheme = [
                'primary_color' => '#0284c7',
                'primary_rgb' => '2 132 199',
                'radius_size' => '0.75rem',
                'header_bg' => '#ffffff',
                'sidebar_collapsed' => false
            ];
            View::share('themeSettings', $defaultTheme);
            Inertia::share(['themeSettings' => $defaultTheme]);
        }
    }
}