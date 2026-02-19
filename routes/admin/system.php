<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\DynamicReportController;

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

    // Settings & Logs
    Route::get('/settings', [SettingController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/settings/test-wp', [SettingController::class, 'testWpConnection'])->name('settings.test_wp');
    Route::post('/settings/test-sms', [SettingController::class, 'testSmsConnection'])->name('settings.test_sms');
    Route::get('/logs', [SettingController::class, 'logs'])->name('logs');

    // Email Themes
    Route::post('/email-themes', [SettingController::class, 'storeTheme'])->name('email-themes.store');
    Route::put('/email-themes/{id}', [SettingController::class, 'updateTheme'])->name('email-themes.update');
    Route::delete('/email-themes/{id}', [SettingController::class, 'destroyTheme'])->name('email-themes.destroy');
});
