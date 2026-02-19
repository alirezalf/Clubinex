<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController; 
use App\Http\Controllers\ClubController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\LuckyWheelController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\GeneralController;

/*
|--------------------------------------------------------------------------
| User Panel Routes
|--------------------------------------------------------------------------
|
| Routes for authenticated users (Dashboard, Profile, Features).
|
*/

Route::middleware(['auth', 'active.user'])->group(function () {
    
    // Dashboard & Home
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/quick-access', [DashboardController::class, 'updateQuickAccess'])->name('dashboard.quick-access.update'); 

    // Profile & Settings 
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::post('/profile', [ProfileController::class, 'update']);
    
    // Changed URI to avoid collision with Fortify's default /user/password route
    Route::post('/profile/security/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::post('/user/theme', [ProfileController::class, 'updateTheme'])->name('user.theme.update'); 

    // Clubs Management
    Route::get('/clubs', [ClubController::class, 'index'])->name('clubs.index');
    Route::post('/clubs/{club}/join', [ClubController::class, 'join'])->name('clubs.join');
    Route::post('/clubs/upgrade', [ClubController::class, 'upgrade'])->name('club.upgrade');

    // Products & Points
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products/register', [ProductController::class, 'registerProduct'])->name('products.register');
    
    // روت‌های جدید برای ویرایش و حذف درخواست
    Route::get('/products/registrations/{id}/edit', [ProductController::class, 'editRegistration'])->name('products.registrations.edit');
    Route::post('/products/registrations/{id}', [ProductController::class, 'updateRegistration'])->name('products.registrations.update'); // POST supports file upload better with method spoofing if needed, but here we use simple POST for update logic often in Laravel with files
    Route::delete('/products/registrations/{id}', [ProductController::class, 'destroyRegistration'])->name('products.registrations.destroy');

    Route::post('/products/check-serial', [ProductController::class, 'checkSerial'])->name('products.check_serial');

    // Rewards & Shop
    Route::get('/rewards', [RewardController::class, 'index'])->name('rewards.index');
    Route::post('/rewards/{reward}/redeem', [RewardController::class, 'redeem'])->name('rewards.redeem');

    // Lucky Wheel (Gamification)
    Route::get('/lucky-wheel', [LuckyWheelController::class, 'index'])->name('lucky-wheel.index');
    Route::post('/lucky-wheel/spin', [LuckyWheelController::class, 'spin'])->name('lucky-wheel.spin');

    // Surveys & Quizzes
    Route::get('/surveys', [SurveyController::class, 'index'])->name('surveys.index');
    Route::get('/surveys/{survey:slug}', [SurveyController::class, 'show'])->name('surveys.show');
    Route::post('/surveys/{survey}/submit', [SurveyController::class, 'submit'])->name('surveys.submit');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/count', [NotificationController::class, 'unreadCount'])->name('notifications.count');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Support Tickets
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/{id}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->name('tickets.reply');
    Route::post('/tickets/{id}/close', [TicketController::class, 'close'])->name('tickets.close');

    // Referral System
    Route::get('/referrals', [ReferralController::class, 'index'])->name('referrals.index');

    // Data Exports
    Route::get('/export/transactions', [ExportController::class, 'transactions'])->name('export.transactions');
    
    // API Helpers (Internal)
    Route::post('/api/users/lookup', [GeneralController::class, 'lookupUser'])->name('api.users.lookup');
    Route::get('/api/users/search', [GeneralController::class, 'searchUsers'])->name('api.users.search');
    
    // Global Search API (New)
    Route::get('/api/global-search', [GeneralController::class, 'globalSearch'])->name('api.global.search');
});