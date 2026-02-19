<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reward;
use App\Models\Club;
use App\Models\User;
use App\Models\RewardRedemption;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        $clubs = Club::all();
        if ($clubs->isEmpty()) return;

        // 1. ایجاد جوایز
        $rewardsData = [
            [
                'title' => 'کارت هدیه ۲۰۰ هزار تومانی',
                'description' => 'کارت هدیه خرید از دیجی‌کالا',
                'points_cost' => 2000,
                'type' => 'digital',
                'stock' => 50,
                'required_club_id' => $clubs->where('slug', 'bronze')->first()->id ?? null,
            ],
            [
                'title' => 'هدفون بلوتوثی',
                'description' => 'هدفون با کیفیت صدای عالی',
                'points_cost' => 5000,
                'type' => 'physical',
                'stock' => 10,
                'required_club_id' => $clubs->where('slug', 'silver')->first()->id ?? null,
            ],
            [
                'title' => 'ساعت هوشمند',
                'description' => 'ساعت هوشمند مدل X',
                'points_cost' => 10000,
                'type' => 'physical',
                'stock' => 5,
                'required_club_id' => $clubs->where('slug', 'gold')->first()->id ?? null,
            ],
            [
                'title' => 'کد تخفیف ۵۰ درصدی',
                'description' => 'قابل استفاده برای خرید محصولات سایت',
                'points_cost' => 500,
                'type' => 'discount_code',
                'stock' => 100,
                'required_club_id' => $clubs->where('slug', 'bronze')->first()->id ?? null,
            ],
        ];

        foreach ($rewardsData as $data) {
            Reward::firstOrCreate(['title' => $data['title']], $data);
        }

        // 2. ایجاد درخواست‌های نمونه (Redemptions)
        // پیدا کردن یک ادمین برای اختصاص به درخواست‌های بررسی شده
        $admin = User::role('super-admin')->first() ?? User::first();
        $users = User::where('id', '!=', $admin->id)->inRandomOrder()->take(5)->get();
        $rewards = Reward::all();

        if ($users->count() > 0 && $rewards->count() > 0) {
            foreach ($users as $index => $user) {
                $reward = $rewards->random();
                
                // تعیین وضعیت تصادفی
                $statuses = ['pending', 'processing', 'completed', 'rejected'];
                $status = $statuses[rand(0, 3)];
                
                // اگر وضعیت در انتظار نباشد، یعنی ادمین آن را دیده است
                $adminId = ($status !== 'pending') ? $admin->id : null;
                $adminNote = ($status === 'rejected') ? 'امتیاز ناکافی بود یا اطلاعات ناقص است.' : null;
                $trackingCode = ($status === 'completed' && $reward->type === 'physical') ? rand(10000000, 99999999) : null;

                RewardRedemption::create([
                    'user_id' => $user->id,
                    'reward_id' => $reward->id,
                    'points_spent' => $reward->points_cost,
                    'status' => $status,
                    'admin_id' => $adminId, // تست فیلد جدید
                    'admin_note' => $adminNote,
                    'tracking_code' => $trackingCode,
                    'delivery_info' => $reward->type === 'physical' ? [
                        'address' => $user->address ?? 'آدرس پیش فرض',
                        'postal_code' => $user->postal_code,
                        'phone' => $user->mobile
                    ] : null,
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}