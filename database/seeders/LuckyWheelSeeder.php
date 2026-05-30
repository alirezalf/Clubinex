<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LuckyWheel;
use App\Models\LuckyWheelPrize;
use App\Models\LuckyWheelSpin;
use App\Models\User;

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
                'text_color' => '#1e293b',
                'font_size' => 14,
                'text_orientation' => 'horizontal',
            ],
            [
                'title' => '۵۰ امتیاز',
                'type' => 'points',
                'value' => 50,
                'probability' => 20, // 20% شانس
                'color' => '#bfdbfe', // آبی روشن
                'text_color' => '#1e3a8a',
                'font_size' => 16,
                'text_orientation' => 'horizontal',
            ],
            [
                'title' => '۱۰۰ امتیاز',
                'type' => 'points',
                'value' => 100,
                'probability' => 10, // 10% شانس
                'color' => '#86efac', // سبز روشن
                'text_color' => '#14532d',
                'font_size' => 18,
                'text_orientation' => 'vertical',
            ],
            [
                'title' => 'پوچ',
                'type' => 'empty',
                'value' => 0,
                'probability' => 30, // 30% شانس
                'color' => '#fecaca', // قرمز روشن
                'text_color' => '#7f1d1d',
                'font_size' => 14,
                'text_orientation' => 'horizontal',
            ],
            [
                'title' => '۵۰۰ امتیاز',
                'type' => 'points',
                'value' => 500,
                'probability' => 5, // 5% شانس
                'color' => '#fcd34d', // طلایی
                'text_color' => '#78350f',
                'font_size' => 20,
                'text_orientation' => 'vertical',
            ],
            [
                'title' => 'شانس مجدد',
                'type' => 'retry',
                'value' => 0,
                'probability' => 5, // 5% شانس
                'color' => '#d8b4fe', // بنفش
                'text_color' => '#581c87',
                'font_size' => 14,
                'text_orientation' => 'horizontal',
            ],
        ];

        foreach ($prizes as $prize) {
            LuckyWheelPrize::firstOrCreate(
                ['lucky_wheel_id' => $wheel->id, 'title' => $prize['title']],
                $prize
            );
        }

        // ایجاد تاریخچه چرخش برای کاربران تستی
        $users = User::whereDoesntHave('roles', function($q) {
            $q->where('name', 'super-admin');
        })->get();

        $allPrizes = LuckyWheelPrize::where('lucky_wheel_id', $wheel->id)->get();

        if ($users->count() > 0 && $allPrizes->count() > 0) {
            foreach ($users as $user) {
                // هر کاربر بین ۲ تا ۶ بار چرخش می‌کند
                $spinsCount = rand(2, 6);

                for ($i = 0; $i < $spinsCount; $i++) {
                    $randomPrize = $allPrizes->random();
                    $isWin = !in_array($randomPrize->type, ['empty', 'retry']);

                    LuckyWheelSpin::create([
                        'user_id' => $user->id,
                        'lucky_wheel_id' => $wheel->id,
                        'prize_id' => $randomPrize->id,
                        'cost_paid' => $wheel->cost_per_spin,
                        'is_win' => $isWin,
                        'created_at' => now()->subDays(rand(1, 30))->subHours(rand(1, 24)),
                    ]);
                }
            }
        }
    }
}
