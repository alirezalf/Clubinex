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

    public function index($tab = 'general')
    {
        $settings = SystemSetting::all()->groupBy('group');
        $admins = collect();
        $notificationTemplates = collect();
        $emailThemes = collect();
        $smsTemplates = collect();
        $machineId = null;
        $licenseInfo = null;

        if ($tab === 'support') {
            $admins = User::whereHas('roles', function($q) {
                $q->whereIn('name', ['super-admin', 'admin', 'staff']);
            })->select('id', 'first_name', 'last_name', 'email', 'avatar')->get();
        }

        if ($tab === 'templates') {
            $notificationTemplates = NotificationTemplate::with(['emailTheme', 'smsTemplate'])->get();
            $emailThemes = EmailTheme::latest()->get();
            $smsTemplates = SmsTemplate::latest()->get();
        }

        if ($tab === 'email') {
            $emailThemes = EmailTheme::latest()->get();
        }

        if ($tab === 'email_themes') {
            $emailThemes = EmailTheme::latest()->get();
        }

        if ($tab === 'sms_templates') {
            $smsTemplates = SmsTemplate::latest()->get();
        }

        if ($tab === 'modules' || $tab === 'general') {
            $licenseKey = SystemSetting::getValue('general', 'license_key');
            $machineId = \App\Services\LicenseService::getMachineId();
            $licenseStatus = $licenseKey ? \App\Services\LicenseService::verifyLicense($licenseKey) : false;

            if ($licenseStatus) {
                $expDate = \Morilog\Jalali\Jalalian::forge($licenseStatus['exp'])->format('Y/m/d H:i');
                $licenseInfo = [
                    'isValid' => true,
                    'client_name' => $licenseStatus['client_name'] ?? 'نامشخص',
                    'exp' => $licenseStatus['exp'] ?? null,
                    'exp_formatted' => $expDate,
                    'modules' => $licenseStatus['modules'] ?? []
                ];
            } else {
                $licenseInfo = [
                    'isValid' => false,
                    'isExpired' => !empty($licenseKey),
                ];
            }
        }

        return Inertia::render('Admin/Settings', [
            'activeTab' => $tab,
            'settings' => $settings,
            'notificationTemplates' => $notificationTemplates,
            'emailThemes' => $emailThemes,
            'smsTemplates' => $smsTemplates,
            'admins' => $admins,
            'machine_id' => $machineId,
            'license_info' => $licenseInfo,
            'availableTabs' => config('settings.tabs', []), // optionally
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

        // License Key Handling
        if (isset($data['license_key'])) {
            $licenseKey = $data['license_key'];
            $payload = \App\Services\LicenseService::verifyLicense($licenseKey);

            if ($payload !== false) {
                $modules = $payload['modules'] ?? [];
                $moduleKeys = [
                    'enable_referrals', 'enable_wallet', 'enable_clubs',
                    'enable_products', 'enable_rewards', 'enable_lucky_wheel',
                    'enable_surveys', 'enable_tickets', 'enable_reports'
                ];

                SystemSetting::setValue('general', 'license_key', $licenseKey);
                foreach ($moduleKeys as $key) {
                    SystemSetting::setValue('modules', $key, !empty($modules[$key]) ? '1' : '0');
                }
            } else {
                return back()->with('error', 'کد لایسنس نامعتبر است یا منقضی شده است و یا متعلق به سرور دیگری است.');
            }

            unset($data['license_key']);
            foreach (['enable_referrals', 'enable_wallet', 'enable_clubs', 'enable_products', 'enable_rewards', 'enable_lucky_wheel', 'enable_surveys', 'enable_tickets', 'enable_reports'] as $k) {
                if(isset($data[$k])) unset($data[$k]);
            }
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
            } elseif (str_starts_with($key, 'payment_')) {
                $group = 'payment';
            } elseif (str_starts_with($key, 'mail_')) {
                $group = 'email';
            } elseif (str_starts_with($key, 'sms_') || $key === 'resend_interval') {
                $group = 'sms';
            } elseif (str_starts_with($key, 'wp_')) {
                $group = 'wordpress';
            } elseif (str_starts_with($key, 'enable_')) {
                $group = 'modules';
            } else {
                $group = $existingKeys[$key] ?? 'general';
            }

            SystemSetting::setValue($group, $key, $value);
        }

        // Clear cache
        cache()->forget('global_settings');
        cache()->forget('modules_settings');
        cache()->forget('login_settings');
        cache()->forget('site_settings');

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
            cache()->forget('site_settings');

            return back()->with('message', "تنظیمات بخش {$group} به حالت پیش‌فرض بازگشت.");

        } catch (\Exception $e) {
            return back()->with('error', 'خطا در بازنشانی تنظیمات: ' . $e->getMessage());
        }
    }

    public function backupDatabase()
    {
        try {
            if (!auth()->user()->hasRole(['super-admin', 'admin'])) {
                abort(403, 'شما دسترسی به این بخش را ندارید.');
            }

            $filename = "backup-" . date('Y-m-d_H-i-s');

            $dbConnection = config('database.default', 'mysql');

            if ($dbConnection === 'sqlite') {
                $sqlitePath = config('database.connections.sqlite.database', database_path('database.sqlite'));
                if (file_exists($sqlitePath)) {
                    return response()->download($sqlitePath, $filename . '.sqlite');
                }
                return back()->with('error', 'پایگاه داده SQLite یافت نشد.');
            }

            if ($dbConnection === 'mysql') {
                if (!function_exists('exec') || in_array(strtolower('exec'), array_map('trim', explode(',', ini_get('disable_functions'))))) {
                    return back()->with('error', 'تابع exec در سرور شما غیرفعال است (احتمالاً هاست اشتراکی هستید). امکان بک‌آپ‌گیری خودکار دیتابیس MySQL در این هاست وجود ندارد، لطفاً از پنل هاست (مانند PhpMyAdmin) پشتیبان بگیرید.');
                }

                $dbHost = config('database.connections.mysql.host', '127.0.0.1');
                $dbPort = config('database.connections.mysql.port', '3306');
                $dbUser = config('database.connections.mysql.username', 'root');
                $dbPass = config('database.connections.mysql.password', '');
                $dbName = config('database.connections.mysql.database', 'laravel');

                $path = sys_get_temp_dir() . '/' . $filename . '.sql';

                // Use putenv to hide password from ps list
                putenv("MYSQL_PWD=" . $dbPass);
                $command = "mysqldump --user=" . escapeshellarg($dbUser) . " --host=" . escapeshellarg($dbHost) . " --port=" . escapeshellarg($dbPort) . " " . escapeshellarg($dbName) . " > " . escapeshellarg($path);

                exec($command, $output, $returnVar);
                putenv("MYSQL_PWD"); // Unset

                if ($returnVar !== 0) {
                     return back()->with('error', 'اجرای دستور بک‌آپ با خطا مواجه شد. در سرورهای اشتراکی ممکن است دسترسی mysqldump مسدود باشد.');
                }

                if (file_exists($path)) {
                    return response()->download($path)->deleteFileAfterSend(true);
                }
            }

            return back()->with('error', 'پشتیبان‌گیری برای نوع دیتابیس فعلی پشتیبانی نمی‌شود.');

        } catch (\Exception $e) {
            \Log::error("Database backup failed: " . $e->getMessage());
            return back()->with('error', 'خطا در ایجاد بک‌آپ: ' . $e->getMessage());
        }
    }

    public function createUpdatePackage()
    {
        try {
            if (!auth()->user()->hasRole(['super-admin', 'admin'])) {
                abort(403, 'شما دسترسی به این بخش را ندارید.');
            }

            if (!class_exists('ZipArchive')) {
                return back()->with('error', 'افزونه ZipArchive در PHP سرور شما فعال نیست.');
            }

            // Create a fixed version name based on the current hour to avoid IDM filename mismatch
            $version = 'update-' . date('Y-m-d_H') . '.zip';
            $zipFileName = sys_get_temp_dir() . '/' . $version;

            // If the zip file was created in the last 15 minutes, just return it
            if (file_exists($zipFileName) && (time() - filemtime($zipFileName)) < 900) {
                return response()->download($zipFileName, $version, [
                    'Accept-Ranges' => 'none',
                ]);
            }

            $zip = new \ZipArchive();
            if ($zip->open($zipFileName, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                return back()->with('error', "خطا در ایجاد فایل فشرده در مسیر موقت.");
            }

            $basePath = base_path();

            // Directories and files to exclude from the update package
            $excludes = [
                '.git',
                '.env',
                '.env.example',
                'storage',
                'node_modules',
                'vendor', // Also skip vendor folder, as it can be huge and standard updates usually need composer update
                'tests',
                'phpunit.xml',
                'bootstrap/cache',
                '.idea',
                '.vscode',
                'public/uploads', // User uploads
                'public/storage', // Storage symlink
                'database/database.sqlite', // Local DB
            ];

            $directory = new \RecursiveDirectoryIterator($basePath, \FilesystemIterator::SKIP_DOTS);

            $filter = new \RecursiveCallbackFilterIterator($directory, function ($current, $key, $iterator) use ($basePath, $excludes, $zipFileName) {
                if ($current->isLink()) {
                    return false;
                }

                $realPath = $current->getRealPath();
                if ($realPath === false) {
                    return false;
                }

                $relativePath = str_replace($basePath . DIRECTORY_SEPARATOR, '', $realPath);
                $relativePath = str_replace('\\', '/', $relativePath);

                if ($realPath === $zipFileName || str_ends_with($relativePath, '.zip')) {
                    return false;
                }

                // If path is exactly in excludes, skip it from recursion/iteration
                if (in_array($relativePath, $excludes)) {
                    return false;
                }

                return true;
            });

            $iterator = new \RecursiveIteratorIterator($filter, \RecursiveIteratorIterator::SELF_FIRST);

            $count = 0;
            foreach ($iterator as $file) {
                $realPath = $file->getRealPath();
                $relativePath = str_replace($basePath . DIRECTORY_SEPARATOR, '', $realPath);
                $relativePath = str_replace('\\', '/', $relativePath);

                if ($file->isDir()) {
                    $zip->addEmptyDir($relativePath);
                } elseif ($file->isFile()) {
                    $zip->addFile($realPath, $relativePath);
                    $count++;
                }
            }

            $zip->close();

            if (file_exists($zipFileName)) {
                return response()->download($zipFileName, $version, [
                    'Accept-Ranges' => 'none',
                ]);
            }

            return back()->with('error', 'فایل بروزرسانی یافت نشد.');
        } catch (\Exception $e) {
            \Log::error("Create Update Package Error: " . $e->getMessage());
            return back()->with('error', 'خطا در ایجاد بسته بروزرسانی: ' . $e->getMessage());
        }
    }

    public function updateSystem(Request $request)
    {
        try {
            if (!auth()->user()->hasRole(['super-admin', 'admin'])) {
                abort(403, 'شما دسترسی به این بخش را ندارید.');
            }

            // Clear all system caches first
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');

            // Runs all outstanding migrations
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);

            // Clear all system caches to ensure fresh config/routes
            \Illuminate\Support\Facades\Artisan::call('optimize:clear');

            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            return back()->with('message', 'بروزرسانی فایل‌ها، دیتابیس و پاکسازی کش با موفقیت کامل انجام شد.');
        } catch (\Exception $e) {
            \Log::error("System Update Error: " . $e->getMessage());
            return back()->with('error', 'خطا در عملیات بروزرسانی: ' . $e->getMessage());
        }
    }

    public function uploadUpdate(Request $request)
    {
        $request->validate([
            'update_file' => 'required|file|mimes:zip|max:102400', // max 100MB
        ]);

        try {
            if (!auth()->user()->hasRole(['super-admin', 'admin'])) {
                abort(403, 'شما دسترسی به این بخش را ندارید.');
            }

            if (!class_exists('ZipArchive')) {
                return back()->with('error', 'افزونه ZipArchive در PHP سرور شما فعال نیست. لطفا از هاستینگ بخواهید آن را فعال کند.');
            }

            $zipPath = $request->file('update_file')->path();
            $zip = new \ZipArchive;

            if ($zip->open($zipPath) === TRUE) {
                // Ensure safe extraction (no absolute paths or path traversal)
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    // Prevent path traversal
                    if (str_contains($filename, '..') || str_starts_with($filename, '/') || str_starts_with($filename, '\\')) {
                        $zip->close();
                        return back()->with('error', 'فایل آپدیت نامعتبر است (مسیرهای غیرمجاز یافت شد).');
                    }
                }

                $zip->extractTo(base_path());
                $zip->close();

                // Clear Opcache if available to ensure new PHP files are read
                if (function_exists('opcache_reset')) {
                    opcache_reset();
                }

                // Clear all caches first to load new configurations and classes
                \Illuminate\Support\Facades\Artisan::call('optimize:clear');

                // Run system updates
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);

                // Final cache clear just in case
                \Illuminate\Support\Facades\Artisan::call('optimize:clear');

                return back()->with('message', 'برنامه با موفقیت از طریق فایل آپدیت به نسخه جدید بروزرسانی شد.');
            } else {
                return back()->with('error', 'امکان باز کردن فایل آپدیت وجود ندارد.');
            }
        } catch (\Exception $e) {
            \Log::error("Update extraction error: " . $e->getMessage());
            return back()->with('error', 'خطا در فرآیند بروزرسانی: ' . $e->getMessage());
        }
    }
}
