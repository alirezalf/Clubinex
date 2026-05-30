<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ReferralNetwork;
use App\Models\PointRule;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReferralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        $this->run();
    }

    public function run(): void
    {
        $users = User::all();
        $pointRule = PointRule::firstOrCreate(
            ['action_code' => 'refer_friend'],
            [
                'points_required' => 0,
                'title' => 'امتیاز معرفی دوست',
                'points' => 50,
                'type' => 'repeatable',
                'description' => 'امتیاز معرفی دوست',
                'is_active' => true,
            ]
        );

        if ($users->count() < 2) {
            return;
        }

        $referrers = $users->random(min(5, $users->count()));

        foreach ($referrers as $referrer) {
            $referredUsers = $users->where('id', '!=', $referrer->id)->random(min(3, $users->count() - 1));

            foreach ($referredUsers as $referred) {
                // Prevent duplicate or cyclic referrals
                if (ReferralNetwork::where('referred_id', $referred->id)->exists() ||
                    ReferralNetwork::where('referrer_id', $referred->id)->where('referred_id', $referrer->id)->exists()) {
                    continue;
                }

                ReferralNetwork::create([
                    'referrer_id' => $referrer->id,
                    'referred_id' => $referred->id,
                    'level' => 1,
                    'status' => 'active',
                    'activated_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}
