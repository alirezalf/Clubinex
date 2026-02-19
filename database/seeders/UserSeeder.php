<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Club;
use App\Models\Agent;
use App\Models\UserStatus;
use App\Models\Province;
use App\Models\City;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // دریافت شناسه‌های مورد نیاز
        $activeStatus = UserStatus::where('slug', 'active')->first()->id;
        $clubs = Club::all();
        $bronzeClub = $clubs->where('slug', 'bronze')->first()->id;
        $goldClub = $clubs->where('slug', 'gold')->first()->id;
        $diamondClub = $clubs->where('slug', 'diamond')->first()->id;

        // دریافت شناسه استان و شهر تهران برای کاربران ثابت
        $tehranProv = Province::where('name', 'تهران')->first();
        $tehranCity = City::where('name', 'تهران')->first();
        
        $tehranProvId = $tehranProv ? $tehranProv->id : null;
        $tehranCityId = $tehranCity ? $tehranCity->id : null;

        // --- 1. ایجاد سوپر ادمین ---
        if (!User::where('mobile', '09196600545')->exists()) {
            $admin = User::create([
                'first_name' => 'علیرضا',
                'last_name' => 'لباف',
                'mobile' => '09196600545',
                'email' => 'alirezalf@gmail.com',
                'password' => Hash::make('admin'),
                'status_id' => $activeStatus,
                'club_id' => $diamondClub, // ادمین بالاترین سطح را دارد
                'current_points' => 999999,
                'profile_completed' => true,
                'referral_code' => 'ADMIN001',
                'email_verified_at' => now(),
                'otp_verified_at' => now(),
                'national_code' => '0011223344',
                'birth_date' => '1990-01-01',
                'gender' => 'male',
                'marital_status' => 'single',
                'job' => 'مدیر سیستم',
                'province_id' => $tehranProvId,
                'city_id' => $tehranCityId,
                'postal_code' => '1999999999',
                'address' => 'تهران، میدان ونک، خیابان ولیعصر، برج فناوری، طبقه ۱۰',
                'last_login_at' => now(),
                // تنظیمات داشبورد ادمین
                'dashboard_preferences' => [
                    'quick_access' => ['admin_users', 'admin_products', 'admin_reports', 'admin_tickets', 'notifications']
                ],
                // تم اختصاصی ادمین (کمی تیره‌تر)
                'theme_preferences' => [
                    'primary_color' => '#1e293b', // Slate 800
                    'sidebar_bg' => '#0f172a',    // Slate 900
                    'sidebar_text' => '#f8fafc',  // Slate 50
                    'header_bg' => '#ffffff',
                    'radius_size' => '0.5rem'
                ]
            ]);
            
            $admin->assignRole('super-admin');
        } else {
            $admin = User::where('mobile', '09196600545')->first();
        }

        // --- 2. ایجاد نماینده فروش (Agent) ---
        if (!User::where('mobile', '09120000001')->exists()) {
            $agentUser = User::create([
                'first_name' => 'رضا',
                'last_name' => 'فروشنده',
                'mobile' => '09120000001',
                'email' => 'agent@clubinex.com',
                'password' => Hash::make('password'),
                'status_id' => $activeStatus,
                'club_id' => $goldClub,
                'current_points' => 5000,
                'profile_completed' => true,
                'referral_code' => 'AGENT001',
                'referred_by' => $admin->id, // معرفی شده توسط ادمین
                'email_verified_at' => now(),
                'otp_verified_at' => now(),
                'national_code' => '1234567899',
                'birth_date' => '1985-05-15',
                'gender' => 'male',
                'marital_status' => 'married',
                'job' => 'نماینده فروش',
                'province_id' => $tehranProvId,
                'city_id' => $tehranCityId,
                'postal_code' => '1111111111',
                'address' => 'تهران، بازار موبایل ایران، طبقه همکف، پلاک ۲۴',
                'last_login_at' => now()->subHours(2),
                'dashboard_preferences' => [
                    'quick_access' => ['products', 'referrals', 'rewards', 'profile']
                ],
                'theme_preferences' => [
                    'primary_color' => '#059669', // Emerald 600
                    'radius_size' => '0.75rem'
                ]
            ]);

            $agentUser->assignRole('agent');

            // ایجاد رکورد در جدول agents
            Agent::create([
                'user_id' => $agentUser->id,
                'agent_code' => 'AG-TEH-1001',
                'store_name' => 'فروشگاه مرکزی موبایل',
                'area' => 'تهران - بازار',
                'max_clients' => 100,
                'commission_rate' => 5.00,
                'is_active' => true,
                'verified_at' => now(),
            ]);
        } else {
            $agentUser = User::where('mobile', '09120000001')->first();
        }

        // --- 3. ایجاد کاربران فیک ---
        $firstNames = ['علی', 'محمد', 'سارا', 'مریم', 'رضا', 'حسین', 'زهرا', 'فاطمه', 'امید', 'نیکا', 'کاوه', 'لادن'];
        $lastNames = ['احمدی', 'حسینی', 'رضایی', 'کریمی', 'محمدی', 'عباسی', 'تقوی', 'راد', 'نیازی', 'شمس', 'کیانی', 'زند'];
        $jobs = ['برنامه‌نویس', 'طراح گرافیک', 'حسابدار', 'معلم', 'پزشک', 'مهندس عمران', 'فروشنده', 'دانشجو', 'خانه دار', 'آزاد'];
        $colors = ['#0284c7', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777']; // تنوع رنگی تم
        
        // دریافت لیست شهرها برای انتخاب تصادفی
        $allCities = City::with('province')->get();

        // لیستی از آیدی‌های کاربرانی که می‌توانند معرف باشند (ادمین و ایجنت در ابتدا)
        $referrers = [$admin->id, $agentUser->id];

        for ($i = 0; $i < 20; $i++) {
            $randomClub = $clubs->random();
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            
            // انتخاب یک شهر تصادفی
            $randomCity = $allCities->count() > 0 ? $allCities->random() : null;
            
            // تولد تصادفی
            $birthDate = now()->subYears(rand(18, 55))->subDays(rand(0, 365));

            // انتخاب معرف تصادفی (با شانس 70 درصد داشتن معرف)
            $referrerId = null;
            if (rand(1, 100) <= 70) {
                $referrerId = $referrers[array_rand($referrers)];
            }

            $user = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'mobile' => '09' . rand(10, 19) . rand(1000000, 9999999),
                'email' => "user{$i}_" . uniqid() . "@example.com",
                'password' => Hash::make('password'),
                'status_id' => $activeStatus,
                'club_id' => $randomClub->id,
                'current_points' => rand($randomClub->min_points, $randomClub->max_points ?? $randomClub->min_points + 5000),
                'profile_completed' => rand(0, 1) == 1,
                'referral_code' => strtoupper(substr(md5(microtime()), 0, 8)),
                'referred_by' => $referrerId,
                'email_verified_at' => now(),
                'otp_verified_at' => now(),
                'national_code' => rand(1111111111, 9999999999),
                'birth_date' => $birthDate->format('Y-m-d'),
                'gender' => rand(0, 1) ? 'male' : 'female',
                'marital_status' => rand(0, 1) ? 'single' : 'married',
                'job' => $jobs[array_rand($jobs)],
                'province_id' => $randomCity ? $randomCity->province_id : null, 
                'city_id' => $randomCity ? $randomCity->id : null,
                'address' => 'خیابان اصلی، کوچه فرعی، پلاک ' . rand(1, 100),
                'postal_code' => rand(1111111111, 9999999999),
                'last_login_at' => now()->subHours(rand(1, 100)),
                'theme_preferences' => [
                    'primary_color' => $colors[array_rand($colors)],
                    'radius_size' => rand(0, 1) ? '0.75rem' : '1rem'
                ],
                'dashboard_preferences' => [
                    'quick_access' => Arr::random(['products', 'rewards', 'lucky_wheel', 'surveys', 'tickets'], rand(3, 5))
                ]
            ]);

            $user->assignRole('user');
            
            // اضافه کردن این کاربر به لیست معرف‌ها برای کاربران بعدی (شبکه سازی)
            $referrers[] = $user->id;
        }
    }
}