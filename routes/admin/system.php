<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\DynamicReportController;
use App\Http\Controllers\Admin\EmailThemeController;
use App\Http\Controllers\Admin\SystemLogController;
use App\Http\Controllers\Admin\IntegrationController;

// --- Reports (General Access) ---
Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
Route::get('/reports/user-stats/{id}', [ReportController::class, 'userStats'])->name('reports.user_stats');
Route::get('/reports/survey-stats/{id}', [ReportController::class, 'surveyStats'])->name('reports.survey_stats');
Route::get('/reports/survey-stats/{id}/export', [ReportController::class, 'exportSurveyParticipants'])->name('reports.export_survey_participants');

// --- System Management (Super Admin / Admin Only) ---
Route::middleware(['role:super-admin|admin'])->group(function () {

    // Sliders
    Route::resource('sliders', SliderController::class)->except(['show']);
    Route::post('/sliders/{slider}/slides', [SliderController::class, 'storeSlide'])->name('sliders.slides.store');
    Route::post('/slides/{slide}', [SliderController::class, 'updateSlide'])->name('sliders.slides.update');
    Route::delete('/slides/{slide}', [SliderController::class, 'destroySlide'])->name('sliders.slides.destroy');
    Route::post('/slides/{slide}/duplicate', [SliderController::class, 'duplicateSlide'])->name('sliders.slides.duplicate');

    // Dynamic Reports
    Route::get('/reports/dynamic', [DynamicReportController::class, 'index'])->name('reports.dynamic');
    Route::get('/reports/dynamic/fetch', [DynamicReportController::class, 'fetchData'])->name('reports.dynamic.fetch');
    Route::get('/reports/dynamic/export', [DynamicReportController::class, 'export'])->name('reports.dynamic.export');
    Route::get('/reports/dynamic/columns/{table}', [DynamicReportController::class, 'getTableColumns'])->name('reports.dynamic.columns');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/reset-defaults', [SettingController::class, 'resetDefaults'])->name('settings.reset_defaults');
    Route::post('/settings/clear-cache', [SettingController::class, 'clearCache'])->name('settings.clear_cache');

    // Integration Tests
    Route::post('/settings/test-wp', [IntegrationController::class, 'testWpConnection'])->name('settings.test_wp');
    Route::post('/settings/test-email', [IntegrationController::class, 'testEmailConnection'])->name('settings.test_email');
    Route::post('/settings/test-sms', [IntegrationController::class, 'testSmsConnection'])->name('settings.test_sms');

    // Logs
    Route::get('/logs', [SystemLogController::class, 'index'])->name('logs');

    // Email Themes
    Route::post('/email-themes', [EmailThemeController::class, 'store'])->name('email-themes.store');
    Route::put('/email-themes/{id}', [EmailThemeController::class, 'update'])->name('email-themes.update');
    Route::delete('/email-themes/{id}', [EmailThemeController::class, 'destroy'])->name('email-themes.destroy');
});
