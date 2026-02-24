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

// --- Public Routes ---
Route::get('/', function () {
    $seo = [
        'title' => \App\Models\SystemSetting::getValue('general', 'site_title', 'Clubinex'),
        'description' => \App\Models\SystemSetting::getValue('general', 'site_description', ''),
    ];
    $slider = \App\Models\Slider::with('activeSlides')->where('location_key', 'home_main')->where('is_active', true)->first();

    return Inertia::render('Welcome', [
        'seo' => $seo,
        'slider' => $slider
    ]);
})->name('home');

// --- Utility Routes ---

// Emergency Fix (Clear Caches)
Route::get('/fix-system', function () {
    try {
        Artisan::call('optimize:clear');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');

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
require __DIR__ . '/auth.php';

// 2. User Panel (Dashboard, Profile, Features)
require __DIR__ . '/panel.php';

// 3. Admin Panel (Management Routes)
require __DIR__ . '/admin.php';
