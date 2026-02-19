<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // جلوگیری از خطای عدم وجود جدول کش در هنگام سید کردن
        // اگر درایور دیتابیس بود ولی جدولش نبود، موقتاً به آرایه سوئیچ کن
        try {
            if (config('cache.default') === 'database' && !Schema::hasTable('cache')) {
                config(['cache.default' => 'array']);
            }
        } catch (\Exception $e) {
            // نادیده گرفتن خطا
        }

        // 1. تعریف ماژول‌ها و اکشن‌های استاندارد
        $modules = [
            'users' => 'کاربران',
            'products' => 'محصولات',
            'categories' => 'دسته‌بندی‌ها',
            'rewards' => 'جوایز',
            'clubs' => 'باشگاه‌ها',
            'sliders' => 'اسلایدرها',
            'reports' => 'گزارشات',
            'settings' => 'تنظیمات',
            'tickets' => 'تیکت‌ها',
            'notifications' => 'اعلان‌ها',
            'gamification' => 'بازی‌سازی',
        ];

        $actions = [
            'view' => 'مشاهده',
            'create' => 'ایجاد',
            'edit' => 'ویرایش',
            'delete' => 'حذف',
        ];

        // 2. ایجاد پرمیشن‌ها
        foreach ($modules as $moduleKey => $moduleName) {
            foreach ($actions as $actionKey => $actionName) {
                $permissionName = "{$moduleKey}.{$actionKey}";
                // مثال: users.view, products.create
                Permission::firstOrCreate(['name' => $permissionName]);
            }
        }
        
        // اضافه کردن پرمیشن‌های خاص
        $extraPermissions = [
            'dashboard.view',
            'products.import',
            'products.sync_wp',
            'products.approve',
            'rewards.approve',
        ];
        
        foreach ($extraPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // 3. ایجاد نقش‌ها
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $agentRole = Role::firstOrCreate(['name' => 'agent']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // 4. تخصیص پرمیشن‌ها
        
        // سوپر ادمین: همه چیز
        $superAdminRole->givePermissionTo(Permission::all());
        
        // ادمین: همه چیز به جز برخی تنظیمات حساس (در صورت نیاز) - فعلا همه چیز
        $adminRole->givePermissionTo(Permission::all());

        // کارمند: مشاهده و ویرایش، بدون حذف
        $staffPermissions = Permission::where('name', 'like', '%.view')
            ->orWhere('name', 'like', '%.create')
            ->orWhere('name', 'like', '%.edit')
            ->get();
        $staffRole->syncPermissions($staffPermissions);

        // ایجنت: دسترسی محدود
        $agentRole->syncPermissions([
            'dashboard.view',
            'products.create', // ثبت محصول
            'products.view',
            'reports.view',    // مشاهده گزارشات خودش (کنترلر باید محدود کند)
        ]);

        // کاربر عادی
        $userRole->syncPermissions(['dashboard.view']);
    }
}