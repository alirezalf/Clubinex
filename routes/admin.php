<?php

use Illuminate\Support\Facades\Route;

// لودر اصلی روت‌های پنل مدیریت
// تمام فایل‌های داخل پوشه routes/admin به صورت خودکار اینجا فراخوانی می‌شوند

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['web', 'auth', 'active.user', 'role:super-admin|admin|staff'])
    ->group(function () {
        
        // 1. مدیریت کاربران و دسترسی‌ها
        require __DIR__ . '/admin/users.php';

        // 2. مدیریت محصولات و انبار
        require __DIR__ . '/admin/products.php';

        // 3. ابزارهای بازاریابی (باشگاه، بازی، جوایز)
        require __DIR__ . '/admin/marketing.php';

        // 4. پشتیبانی و ارتباطات
        require __DIR__ . '/admin/support.php';

        // 5. تنظیمات و گزارشات سیستم
        require __DIR__ . '/admin/system.php';

    });
