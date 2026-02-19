<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LockScreenController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| This file handles login, registration, OTP, and logout routes.
|
*/

Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    
    // محدودیت: ۵ بار تلاش در ۱ دقیقه برای لاگین معمولی
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');
    
    // OTP (Mobile Login)
    // محدودیت حیاتی: حداکثر ۳ درخواست کد تایید در هر ۲ دقیقه برای جلوگیری از SMS Bomber
    Route::post('/login/otp', [AuthController::class, 'sendOtp'])
        ->name('login.otp.send')
        ->middleware('throttle:3,2'); 
        
    Route::post('/login/verify', [AuthController::class, 'verifyOtp'])
        ->name('login.otp.verify')
        ->middleware('throttle:5,1');

    // Registration
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:3,1'); // جلوگیری از ثبت‌نام انبوه ربات‌ها
});

// Logout & Lock Screen (Requires Auth)
Route::middleware('auth')->group(function() {
    Route::get('/lock-screen', [LockScreenController::class, 'show'])->name('lock-screen');
    Route::post('/lock-screen/unlock', [LockScreenController::class, 'unlock'])
        ->name('lock-screen.unlock')
        ->middleware('throttle:5,1');
        
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});