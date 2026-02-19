<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PointTransaction;
use Illuminate\Database\Seeder;

class PointTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        foreach ($users as $user) {
            // استفاده از متد createTransaction برای اطمینان از آپدیت شدن current_points کاربر
            
            // 1. یک تراکنش مثبت (کسب امتیاز)
            PointTransaction::createTransaction([
                'user_id' => $user->id,
                'amount' => rand(100, 1000),
                'type' => 'earn',
                'description' => 'هدیه ثبت نام اولیه (تستی)',
                'created_at' => now()->subDays(rand(10, 30)),
            ]);

            // 2. یک تراکنش منفی (خرج امتیاز) - با شانس 50%
            if (rand(0, 1)) {
                $spendAmount = rand(50, 200);
                // بررسی موجودی قبل از کسر (هرچند متد createTransaction بررسی نمی‌کند اما برای منطق صحیح خوب است)
                if ($user->refresh()->current_points >= $spendAmount) {
                    PointTransaction::createTransaction([
                        'user_id' => $user->id,
                        'amount' => -$spendAmount,
                        'type' => 'spend',
                        'description' => 'خرید جایزه تستی',
                        'created_at' => now()->subDays(rand(1, 9)),
                    ]);
                }
            }
        }
    }
}