<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\NotificationSettingController;

// --- Tickets ---
Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
Route::get('/tickets/{id}', [TicketController::class, 'show'])->name('tickets.show');
Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->name('tickets.reply');
Route::post('/tickets/{id}/close', [TicketController::class, 'close'])->name('tickets.close');

// --- Notifications ---
Route::get('/notifications/send', [NotificationController::class, 'index'])->name('notifications.send');
Route::post('/notifications/send', [NotificationController::class, 'send'])->name('notifications.post');

// Settings (Super Admin / Admin)
Route::middleware(['role:super-admin|admin'])->group(function () {
    Route::post('/notification-templates/{id}', [NotificationSettingController::class, 'update'])->name('notification-templates.update');
});
