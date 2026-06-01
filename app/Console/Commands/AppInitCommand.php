<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\SystemSetting;

class AppInitCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:init';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the application with a super admin and basic settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting application initialization...');

        // 1. Create Super Admin
        $this->info('Creating Super Admin account...');
        $adminMobile = $this->ask('Enter super admin mobile (e.g. 09121234567)');
        $adminPassword = $this->secret('Enter super admin password (min 6 chars)');

        if (strlen($adminPassword) < 6) {
            $this->error('Password must be at least 6 characters.');
            return;
        }

        $admin = User::firstOrCreate(
            ['mobile' => $adminMobile],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($adminPassword),
                'role' => 'admin'
            ]
        );
        $this->info("Super Admin created/updated successfully with mobile: {$admin->mobile}");

        // 2. Initialize default system settings to prevent errors on empty DB
        $this->info('Initializing core system settings...');
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

        DB::beginTransaction();
        try {
            foreach ($coreSettings as $setting) {
                SystemSetting::firstOrCreate(
                    ['group' => $setting['group'], 'key' => $setting['key']],
                    ['value' => $setting['value'], 'type' => 'string']
                );
            }
            DB::commit();
            $this->info('Core settings initialized.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Failed to initialize settings: ' . $e->getMessage());
        }

        // 3. Clear cache
        $this->call('cache:clear');

        $this->info('Application initialization is complete!');
        $this->newLine();
        $this->info('You can now login using the mobile and password you provided.');
    }
}
