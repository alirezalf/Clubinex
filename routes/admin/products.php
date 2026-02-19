<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductSerialController;
use App\Http\Controllers\Admin\CategoryController;

// --- Products ---
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::post('/products', [ProductController::class, 'store'])->name('products.store');
Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
Route::post('/products/registrations/{id}/status', [ProductController::class, 'updateRegistrationStatus'])->name('products.registration_status');

// --- Product Serials ---
Route::post('/products/{id}/import-serials', [ProductSerialController::class, 'import'])->name('products.import_serials');
Route::get('/products/{id}/serials', [ProductSerialController::class, 'index'])->name('products.serials.index');
Route::post('/products/{id}/serials', [ProductSerialController::class, 'store'])->name('products.serials.store');

// --- Categories (Super Admin / Admin Only) ---
Route::middleware(['role:super-admin|admin'])->group(function () {
    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
    Route::post('/categories/wp-schema', [CategoryController::class, 'getWpSchema'])->name('categories.wp_schema');
    Route::post('/categories/wp-sync', [CategoryController::class, 'syncMapped'])->name('categories.wp_sync_mapped');

    // Sensitive Product Actions
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{id}/serials/generate', [ProductSerialController::class, 'generate'])->name('products.serials.generate');
    Route::delete('/serials/{id}', [ProductSerialController::class, 'destroy'])->name('products.serials.destroy');
    Route::post('/products/wp-schema', [ProductController::class, 'getWpSchema'])->name('products.wp_schema');
    Route::post('/products/wp-sync', [ProductController::class, 'syncMapped'])->name('products.wp_sync_mapped');
});
