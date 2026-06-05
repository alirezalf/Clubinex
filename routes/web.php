<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeneralController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Main Web Routes
|--------------------------------------------------------------------------
|
| This file registers the main entry points and loads other route modules.
|
*/

// --- Setup Setup Routes ---
use App\Http\Controllers\SetupController;

Route::get('/setup', [SetupController::class, 'index'])->name('setup.index');
Route::post('/setup', [SetupController::class, 'store'])->name('setup.store');

// --- Public Routes ---
Route::get('/', function () {
    $settings = cache('global_settings', []);
    $seo = [
        'title' => $settings['general.site_title'] ?? 'Clubinex',
        'description' => $settings['general.site_description'] ?? '',
    ];
    $slider = cache()->remember('home_main_slider', 600, function () {
        return \App\Models\Slider::with('activeSlides')->where('location_key', 'home_main')->where('is_active', true)->first();
    });

    return Inertia::render('Welcome', [
        'seo' => $seo,
        'slider' => $slider
    ]);
});

Route::get('/home', function () {
    $settings = cache('global_settings', []);
    $seo = [
        'title' => $settings['general.site_title'] ?? 'Clubinex',
        'description' => $settings['general.site_description'] ?? '',
    ];
    $slider = cache()->remember('home_main_slider', 600, function () {
        return \App\Models\Slider::with('activeSlides')->where('location_key', 'home_main')->where('is_active', true)->first();
    });

    return Inertia::render('Welcome', [
        'seo' => $seo,
        'slider' => $slider
    ]);
})->name('home');


// --- Utility Routes ---
Route::get('/about', function() {
    return Inertia::render('AboutUs', [
        'appVersion' => \App\Models\SystemSetting::getValue('general', 'app_version', '4.3.0'),
        'author' => \App\Models\SystemSetting::getValue('general', 'author', 'علیرضا لباف'),
        'mobile' => \App\Models\SystemSetting::getValue('general', 'support_mobile', '09196600545'),
        'appName' => \App\Models\SystemSetting::getValue('general', 'app_name', 'سیستم باشگاه مشتریان (Clubinex)'),
        'description' => \App\Models\SystemSetting::getValue('general', 'app_description', 'سیستم یکپارچه باشگاه مشتریان با امکانات گیمیفیکیشن، ثبت سریال محصولات، گردونه شانس، نظرسنجی و مدیریت پیشرفته.')
    ]);
})->name('about')->middleware(['auth', 'active.user']);

// Emergency Fix (Clear Caches)
Route::get('/fix-system', function () {
    try {
        Artisan::call('optimize:clear');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('db:seed', ['--class' => 'HelpSeeder', '--force' => true]);

        if(Schema::hasTable('jobs')) DB::table('jobs')->truncate();
        if(Schema::hasTable('failed_jobs')) DB::table('failed_jobs')->truncate();

        $smsSettings = \App\Models\SystemSetting::where('group', 'sms')->get();
        $debugInfo = "<h3>SMS Settings (Group: sms):</h3><ul>";
        foreach($smsSettings as $s) {
            $val = is_string($s->value) ? substr($s->value, 0, 50) : json_encode($s->value);
            $debugInfo .= "<li><strong>{$s->key}</strong>: {$val} (Type: {$s->type})</li>";
        }
        $debugInfo .= "</ul>";

        // Check for orphaned settings
        $orphaned = \App\Models\SystemSetting::where('key', 'like', 'sms_%')->where('group', '!=', 'sms')->get();
        if ($orphaned->count() > 0) {
             $debugInfo .= "<h3>Orphaned SMS Settings (Wrong Group):</h3><ul>";
             foreach($orphaned as $s) {
                $debugInfo .= "<li><strong>{$s->key}</strong>: {$s->value} (Group: {$s->group})</li>";
            }
            $debugInfo .= "</ul>";
        }

        $debugInfo .= "<p>Env SMSIR_API_KEY: " . (env('SMSIR_API_KEY') ? 'Set' : 'Not Set') . "</p>";
        $debugInfo .= "<p>Env SMSIR_TEMPLATE_ID: " . (env('SMSIR_TEMPLATE_ID') ? 'Set' : 'Not Set') . "</p>";

        return "System Optimized & Queue Cleared Successfully! <br> {$debugInfo} <br> <a href='/'>Go Home</a>";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// --- SEO & Content Routes ---
Route::get('/robots.txt', function () {
    $content = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nDisallow: /profile/\n\nSitemap: " . url('/sitemap.xml');
    return response($content)->header('Content-Type', 'text/plain');
});

Route::get('/sitemap.xml', function () {
    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Add primary public routes
    $urls = [
        url('/'),
        url('/login'),
        url('/register'),
    ];

    foreach ($urls as $url) {
        $xml .= '<url>';
        $xml .= '<loc>' . $url . '</loc>';
        $xml .= '<lastmod>' . now()->toAtomString() . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>' . ($url == url('/') ? '1.0' : '0.8') . '</priority>';
        $xml .= '</url>';
    }

    $xml .= '</urlset>';

    return response($xml)->header('Content-Type', 'application/xml');
});

// Captcha Image Generation
Route::get('/captcha/{config?}', function(string $config = 'default') {
    try {
        return app('captcha')->create($config);
    } catch (\Exception $e) {
        return response($e->getMessage(), 500);
    }
});

// General Public API (Cities, etc.)
Route::get('/api/provinces/{province}/cities', [GeneralController::class, 'getCities'])->name('api.cities');

// --- Load Route Modules ---

// 1. Authentication (Login, Register, OTP)
Route::get('/reports/test', function() {
        $controller = app()->make(\App\Http\Controllers\Admin\DynamicReportController::class);
        $request = \Illuminate\Http\Request::create('/admin/reports/dynamic/fetch', 'POST', [
            'table' => 'users',
            'fields' => ['id', 'first_name', 'last_name'],
            'page' => 1,
            'per_page' => 20,
            'sort_dir' => 'desc',
            'advanced_filters' => []
        ]);

        $response = $controller->fetchData($request);
        file_put_contents(base_path('mytest.log'), $response->getContent());
        return "Done. check mytest.log";
});

Route::get('/seed-help', function() {
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--class' => 'HelpSeeder', '--force' => true]);
    return "Help seeded successfully.";
});

require __DIR__ . '/auth.php';

// 2. User Panel (Dashboard, Profile, Features)
require __DIR__ . '/panel.php';

// 3. Admin Panel (Management Routes)
require __DIR__ . '/admin.php';
