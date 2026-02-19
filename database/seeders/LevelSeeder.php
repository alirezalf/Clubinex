<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [
                'title' => 'برنزی',
                'min_points' => 0,
                'max_points' => 999,
                'discount_percent' => 0,
                'icon' => 'bronze_medal',
                'description' => 'سطح پایه برای تمام کاربران جدید',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'نقره‌ای',
                'min_points' => 1000,
                'max_points' => 4999,
                'discount_percent' => 5,
                'icon' => 'silver_medal',
                'description' => 'دسترسی به تخفیف‌های ویژه',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'طلایی',
                'min_points' => 5000,
                'max_points' => 9999,
                'discount_percent' => 10,
                'icon' => 'gold_medal',
                'description' => 'ارسال رایگان و پشتیبانی اختصاصی',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'پلاتینیوم',
                'min_points' => 10000,
                'max_points' => 1000000,
                'discount_percent' => 20,
                'icon' => 'platinum_medal',
                'description' => 'بالاترین سطح دسترسی و هدایای ماهانه',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('levels')->insert($levels);
    }
}