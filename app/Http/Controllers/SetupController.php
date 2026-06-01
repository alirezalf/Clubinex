<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class SetupController extends Controller
{
    public function index()
    {
        // If system already has users, block access
        if (Schema::hasTable('users') && User::count() > 0) {
            return redirect()->route('login')->with('error', 'سیستم قبلا نصب و راه اندازی شده است.');
        }

        return Inertia::render('Setup/Index');
    }

    public function store(Request $request)
    {
        // If system already has users, block access
        if (Schema::hasTable('users') && User::count() > 0) {
            return redirect()->route('login')->with('error', 'سیستم قبلا نصب و راه اندازی شده است.');
        }

        $request->validate([
            'mobile' => ['required', 'string', 'size:11', 'regex:/^09[0-9]{9}$/'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        try {
            DB::beginTransaction();

            // Run migrations just in case (though it should already be done)
            // Artisan::call('migrate', ['--force' => true]);

            // Check or Create UserStatus
            $activeStatus = DB::table('user_statuses')->where('slug', 'active')->first();
            if (!$activeStatus) {
                $statusId = DB::table('user_statuses')->insertGetId([
                    'name' => 'فعال',
                    'slug' => 'active',
                    'color' => '#10B981',
                    'is_active' => true,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $statusId = $activeStatus->id;
            }

            // Create admin role if not exists
            $role = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'admin',
                'guard_name' => 'web'
            ]);

            // 1. Create Super Admin
            $admin = User::where('mobile', $request->mobile)->first();
            if (!$admin) {
                $admin = User::create([
                    'mobile' => $request->mobile,
                    'email' => $request->email,
                    'first_name' => 'مدیریت',
                    'last_name' => 'کل',
                    'password' => Hash::make($request->password),
                    'password_set_at' => now(),
                    'status_id' => $statusId,
                    'profile_completed' => true,
                ]);
                $admin->assignRole('admin');
            }

            // 2. Initialize Core System Settings
            $coreSettings = [
                // General
                ['group' => 'general', 'key' => 'site_name', 'value' => 'Clubinex'],
                ['group' => 'general', 'key' => 'version', 'value' => 'v2.0.1'],
                ['group' => 'general', 'key' => 'maintenance_mode', 'value' => '0'],

                // Login
                ['group' => 'login', 'key' => 'login_theme', 'value' => 'modern'],
                ['group' => 'login', 'key' => 'login_title', 'value' => 'باشگاه مشتریان'],
                ['group' => 'login', 'key' => 'login_subtitle', 'value' => 'به پنل کاربری خوش آمدید'],
                ['group' => 'login', 'key' => 'login_card_glass', 'value' => '0'],
                ['group' => 'login', 'key' => 'login_layout_reversed', 'value' => '0'],

                // Registration
                ['group' => 'registration', 'key' => 'registration_enabled', 'value' => '1'],
                ['group' => 'registration', 'key' => 'require_invite_code', 'value' => '0'],
                ['group' => 'registration', 'key' => 'welcome_sms', 'value' => '1'],
                ['group' => 'registration', 'key' => 'welcome_points', 'value' => '10'],

                // Modules
                ['group' => 'modules', 'key' => 'enable_clubs', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_lucky_wheel', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_products', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_rewards', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_wallet', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_referrals', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_surveys', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_tickets', 'value' => '1'],
                ['group' => 'modules', 'key' => 'enable_reports', 'value' => '1'],
            ];

            foreach ($coreSettings as $setting) {
                SystemSetting::firstOrCreate(
                    ['group' => $setting['group'], 'key' => $setting['key']],
                    ['value' => $setting['value'], 'type' => 'string', 'label' => ucwords(str_replace('_', ' ', $setting['key']))]
                );
            }

            DB::commit();

            Artisan::call('cache:clear');

            return redirect()->route('login')->with('success', 'نصب با موفقیت انجام شد! اکنون می‌توانید وارد حساب مدیریت شوید.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در نصب سیستم: ' . $e->getMessage());
        }
    }
}
