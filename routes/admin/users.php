<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;

// --- Users Management ---
Route::get('/users', [UserController::class, 'usersList'])->name('users');
Route::post('/users', [UserController::class, 'storeUser'])->name('users.store');
Route::put('/users/{id}', [UserController::class, 'updateUser'])->name('users.update');
Route::post('/users/bulk-action', [UserController::class, 'bulkAction'])->name('users.bulk_action');

// Critical User Actions (Super Admin / Admin Only)
Route::middleware(['role:super-admin|admin'])->group(function () {
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleUserStatus'])->name('users.toggle-status');
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetUserPassword'])->name('users.reset-password');
});

// --- Roles & Permissions (Super Admin / Admin Only) ---
Route::middleware(['role:super-admin|admin'])->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
});
