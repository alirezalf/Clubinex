<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\RewardController;
use App\Http\Controllers\Admin\ClubSettingController;
use App\Http\Controllers\Admin\GamificationController;
use App\Http\Controllers\Admin\SurveyController;

// --- Rewards ---
Route::get('/rewards', [RewardController::class, 'index'])->name('rewards.index');
Route::post('/rewards/redemptions/{id}/status', [RewardController::class, 'updateStatus'])->name('rewards.status');
Route::get('/rewards/user-history/{id}', [RewardController::class, 'userHistory'])->name('rewards.user_history');

// --- Club & Gamification (Super Admin / Admin Only) ---
Route::middleware(['role:super-admin|admin'])->group(function () {
    
    // Rewards Management
    Route::post('/rewards', [RewardController::class, 'store'])->name('rewards.store');
    Route::post('/rewards/{id}', [RewardController::class, 'update'])->name('rewards.update');

    // Club Settings
    Route::get('/club/settings', [ClubSettingController::class, 'index'])->name('club.settings');
    Route::post('/clubs', [ClubSettingController::class, 'storeClub'])->name('clubs.store');
    Route::post('/clubs/{id}', [ClubSettingController::class, 'updateClub'])->name('clubs.update');
    Route::delete('/clubs/{id}', [ClubSettingController::class, 'destroyClub'])->name('clubs.destroy');
    Route::post('/point-rules/{id}', [ClubSettingController::class, 'updateRule'])->name('point-rules.update');
    
    // Gamification (Wheel)
    Route::get('/gamification', [GamificationController::class, 'index'])->name('gamification.index');
    Route::post('/lucky-wheel/prize', [GamificationController::class, 'storeWheelPrize'])->name('lucky-wheel.prize.store');
    Route::post('/lucky-wheel/prize/{id}', [GamificationController::class, 'updateWheelPrize'])->name('lucky-wheel.prize.update');
    Route::delete('/lucky-wheel/prize/{id}', [GamificationController::class, 'destroyWheelPrize'])->name('lucky-wheel.prize.destroy');

    // Surveys
    Route::post('/surveys', [SurveyController::class, 'store'])->name('surveys.store');
    Route::put('/surveys/{id}', [SurveyController::class, 'update'])->name('surveys.update');
    Route::post('/surveys/{id}/duplicate', [SurveyController::class, 'duplicate'])->name('surveys.duplicate');
    Route::post('/surveys/{id}/toggle', [SurveyController::class, 'toggle'])->name('surveys.toggle');
    Route::delete('/surveys/{id}', [SurveyController::class, 'destroy'])->name('surveys.destroy');

    Route::get('/surveys/{id}/questions', [SurveyController::class, 'questions'])->name('surveys.questions');
    Route::post('/surveys/{id}/questions', [SurveyController::class, 'storeQuestion'])->name('surveys.questions.store');
    Route::put('/surveys/questions/{id}', [SurveyController::class, 'updateQuestion'])->name('surveys.questions.update');
    Route::delete('/surveys/questions/{id}', [SurveyController::class, 'destroyQuestion'])->name('surveys.questions.destroy');
});
