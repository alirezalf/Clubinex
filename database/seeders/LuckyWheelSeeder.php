<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LuckyWheel;
use App\Models\LuckyWheelPrize;

class LuckyWheelSeeder extends Seeder
{
    public function run(): void
    {
        // ایجاد گردونه اصلی
        $wheel = LuckyWheel::firstOrCreate(
            ['title' => 'گردونه شانس روزانه'],
            [
                'description' => 'هر روز شانس خود را امتحان کنید و جوایز نفیس ببرید!',
                'cost_per_spin' => 50,
                'is_active' => true,
            ]
        );

        // آیتم‌های گردونه
        $prizes = [
            [
                'title' => '۱۰ امتیاز',
                'type' => 'points',
                'value' => 10,
                'probability' => 30, // 30% شانس
                'color' => '#e2e8f0', // خاکستری روشن
            ],
            [
                'title' => '۵۰ امتیاز',
                'type' => 'points',
                'value' => 50,
                'probability' => 20, // 20% شانس
                'color' => '#bfdbfe', // آبی روشن
            ],
            [
                'title' => '۱۰۰ امتیاز',
                'type' => 'points',
                'value' => 100,
                'probability' => 10, // 10% شانس
                'color' => '#86efac', // سبز روشن
            ],
            [
                'title' => 'پوچ',
                'type' => 'empty',
                'value' => 0,
                'probability' => 30, // 30% شانس
                'color' => '#fecaca', // قرمز روشن
            ],
            [
                'title' => '۵۰۰ امتیاز',
                'type' => 'points',
                'value' => 500,
                'probability' => 5, // 5% شانس
                'color' => '#fcd34d', // طلایی
            ],
            [
                'title' => 'شانس مجدد',
                'type' => 'retry',
                'value' => 0,
                'probability' => 5, // 5% شانس
                'color' => '#d8b4fe', // بنفش
            ],
        ];

        foreach ($prizes as $prize) {
            LuckyWheelPrize::firstOrCreate(
                ['lucky_wheel_id' => $wheel->id, 'title' => $prize['title']],
                $prize
            );
        }
    }
}