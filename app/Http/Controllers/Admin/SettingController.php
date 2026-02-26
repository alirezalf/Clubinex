<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\NotificationTemplate;
use App\Models\EmailTheme;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Services\ThemeService;

use App\Models\SmsTemplate;

class SettingController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function index()
    {
        $settings = SystemSetting::all()->groupBy('group');
        $notificationTemplates = NotificationTemplate::with(['emailTheme', 'smsTemplate'])->get();
        $emailThemes = EmailTheme::latest()->get();
        $smsTemplates = SmsTemplate::latest()->get();
        
        $admins = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['super-admin', 'admin', 'staff']);
        })->select('id', 'first_name', 'last_name', 'email', 'avatar')->get();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'notificationTemplates' => $notificationTemplates,
            'emailThemes' => $emailThemes,
            'smsTemplates' => $smsTemplates,
            'admins' => $admins 
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except(['_token', '_method']);
        $themeKeys = ThemeService::getAllowedKeys();

        // 1. Handle Reset Personal Theme
        if ($request->has('reset_personal_theme')) {
             $shouldReset = filter_var($request->reset_personal_theme, FILTER_VALIDATE_BOOLEAN);
             if ($shouldReset) {
                $this->themeService->resetUserTheme(auth()->user());
             }
             unset($data['reset_personal_theme']);
        }

        // 2. Separate Theme Settings from General Settings
        $themeData = [];
        $generalData = [];

        foreach ($data as $key => $value) {
            // Handle File Uploads
            if ($request->hasFile($key)) {
                $file = $request->file($key);
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/settings'), $filename);
                $value = '/uploads/settings/' . $filename;
            }

            if ($value === null && !$request->hasFile($key)) {
                continue; 
            }

            if (in_array($key, $themeKeys)) {
                $themeData[$key] = $value;
            } else {
                $generalData[$key] = $value;
            }
        }

        // 3. Update Theme Settings via Service
        if (!empty($themeData)) {
            $this->themeService->updateSystemTheme($themeData);
        }

        // 4. Update General Settings (Legacy Logic)
        $existingKeys = SystemSetting::pluck('group', 'key')->toArray();
        foreach ($generalData as $key => $value) {
            // Check if it's a login setting
            if (str_starts_with($key, 'login_')) {
                $group = 'login';
            } elseif (str_starts_with($key, 'mail_')) {
                $group = 'email';
            } elseif (str_starts_with($key, 'sms_') || $key === 'resend_interval') {
                $group = 'sms';
            } else {
                $group = $existingKeys[$key] ?? 'general';
            }
            
            SystemSetting::setValue($group, $key, $value);
        }

        // Clear cache
        cache()->forget('global_settings');

        return back()->with('message', 'تنظیمات با موفقیت ذخیره و اعمال شد.');
    }

    // پاکسازی کش سیستم
    public function clearCache()
    {
        try {
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('route:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            
            return back()->with('message', 'کش سیستم با موفقیت پاکسازی شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در پاکسازی کش: ' . $e->getMessage());
        }
    }

    // بازنشانی تنظیمات به حالت پیش‌فرض
    public function resetDefaults(Request $request)
    {
        $group = $request->input('group');
        
        if (!in_array($group, ['theme', 'login', 'general'])) {
            return back()->with('error', 'گروه تنظیمات نامعتبر است.');
        }

        try {
            switch ($group) {
                case 'theme':
                    $defaults = [
                        'primary_color' => '#0284c7',
                        'sidebar_bg' => '#ffffff',
                        'sidebar_text' => '#1f2937',
                        'sidebar_texture' => 'none',
                        'header_bg' => 'rgba(255,255,255,0.8)',
                        'radius_size' => '0.75rem',
                        'card_style' => 'default',
                        'card_shadow' => 'sm',
                        'card_opacity' => '1',
                        'sidebar_collapsed' => false,
                    ];
                    $this->themeService->updateSystemTheme($defaults);
                    break;

                case 'login':
                    $defaults = [
                        'login_theme' => 'classic',
                        'login_layout_reversed' => false,
                        'login_left_bg_type' => 'random',
                        'login_left_color' => '#f3f4f6',
                        'login_right_bg_type' => 'color',
                        'login_right_color' => '#ffffff',
                        'login_title' => 'خوش آمدید',
                        'login_subtitle' => 'به باشگاه مشتریان Clubinex وارد شوید',
                        'login_copyright' => '© 2024 تمامی حقوق محفوظ است.',
                        'login_slogan_title' => 'تجربه ای متفاوت از وفاداری',
                        'login_slogan_text' => 'با پیوستن به باشگاه مشتریان، از تخفیف‌ها و جوایز ویژه بهره‌مند شوید.',
                        'login_title_color' => '#111827',
                        'login_subtitle_color' => '#6b7280',
                        'login_slogan_color' => '#ffffff',
                        'login_copyright_color' => '#9ca3af',
                        'login_btn_bg' => '#0284c7',
                        'login_btn_text' => '#ffffff',
                        'login_card_bg' => '#ffffff',
                    ];
                    foreach ($defaults as $key => $value) {
                        SystemSetting::setValue('login', $key, $value);
                    }
                    break;

                case 'general':
                    $defaults = [
                        'site_title' => 'باشگاه مشتریان کلابینکس',
                        'site_description' => 'بهترین پلتفرم وفاداری مشتریان',
                        'footer_text' => 'تمامی حقوق محفوظ است.',
                    ];
                    foreach ($defaults as $key => $value) {
                        SystemSetting::setValue('general', $key, $value);
                    }
                    // Reset SEO as well if part of general
                    SystemSetting::setValue('seo', 'meta_keywords', 'باشگاه مشتریان, وفاداری, تخفیف, جایزه');
                    break;
            }

            // Clear cache
            cache()->forget('global_settings');
            cache()->forget('global_settings_array');

            return back()->with('message', "تنظیمات بخش {$group} به حالت پیش‌فرض بازگشت.");

        } catch (\Exception $e) {
            return back()->with('error', 'خطا در بازنشانی تنظیمات: ' . $e->getMessage());
        }
    }
}
