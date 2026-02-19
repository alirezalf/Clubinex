<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserStatus;
use App\Models\Club;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. وضعیت‌های پایه
        $statuses = [
            ['name' => 'فعال', 'slug' => 'active', 'color' => 'success', 'order' => 1, 'is_active' => true],
            ['name' => 'غیرفعال', 'slug' => 'inactive', 'color' => 'secondary', 'order' => 2, 'is_active' => true],
            ['name' => 'مسدود', 'slug' => 'banned', 'color' => 'danger', 'order' => 3, 'is_active' => true],
            ['name' => 'در انتظار تایید', 'slug' => 'pending', 'color' => 'warning', 'order' => 4, 'is_active' => true],
        ];
        foreach ($statuses as $status) {
            UserStatus::firstOrCreate(['slug' => $status['slug']], $status);
        }

        // 2. سطوح اصلی باشگاه (Tiers)
        $tiers = [
            ['name' => 'برنزی', 'slug' => 'bronze', 'is_tier' => true, 'min_points' => 0, 'max_points' => 999, 'joining_cost' => 0, 'color' => '#CD7F32', 'icon' => 'award'],
            ['name' => 'نقره‌ای', 'slug' => 'silver', 'is_tier' => true, 'min_points' => 1000, 'max_points' => 4999, 'joining_cost' => 1000, 'color' => '#C0C0C0', 'icon' => 'award'],
            ['name' => 'طلایی', 'slug' => 'gold', 'is_tier' => true, 'min_points' => 5000, 'max_points' => 9999, 'joining_cost' => 5000, 'color' => '#FFD700', 'icon' => 'award'],
            ['name' => 'الماس', 'slug' => 'diamond', 'is_tier' => true, 'min_points' => 10000, 'max_points' => null, 'joining_cost' => 10000, 'color' => '#B9F2FF', 'icon' => 'diamond'],
        ];
        foreach ($tiers as $tier) {
            Club::updateOrCreate(['slug' => $tier['slug']], $tier);
        }

        // 3. باشگاه‌های ویژه (Special Clubs)
        $specialClubs = [
            ['name' => 'باشگاه گیمرها', 'slug' => 'gamers', 'is_tier' => false, 'min_points' => 0, 'joining_cost' => 500, 'color' => '#8b5cf6', 'icon' => 'gamepad', 'benefits' => ['دسترسی به تورنمنت‌ها', 'تخفیف لوازم جانبی']],
            ['name' => 'VIP Lounge', 'slug' => 'vip-lounge', 'is_tier' => false, 'min_points' => 0, 'joining_cost' => 2000, 'color' => '#f43f5e', 'icon' => 'crown', 'benefits' => ['پشتیبانی ۲۴ ساعته', 'ارسال رایگان']],
        ];
        foreach ($specialClubs as $club) {
            Club::updateOrCreate(['slug' => $club['slug']], $club);
        }

        // 4. فراخوانی سایر سیدرها
        $this->call([
            SettingSeeder::class,
            ProvinceSeeder::class, // Added before UserSeeder
            RoleSeeder::class,
            PointRuleSeeder::class,
            EmailThemeSeeder::class,
            NotificationTemplateSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            SurveySeeder::class,
            RewardSeeder::class,
            LuckyWheelSeeder::class,
            PointTransactionSeeder::class,
            SliderSeeder::class,
        ]);
    }
}