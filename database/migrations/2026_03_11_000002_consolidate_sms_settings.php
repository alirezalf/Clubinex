<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\SystemSetting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure 'sms_api_key' is in the 'sms' group
        $setting = SystemSetting::where('group', 'general')->where('key', 'sms_api_key')->first();
        if ($setting) {
            $setting->update(['group' => 'sms']);
        }

        // 2. Add missing SMS settings if they don't exist
        $defaults = [
            'sms_api_key' => env('SMSIR_API_KEY', ''),
            'sms_ir_template_id' => env('SMSIR_TEMPLATE_ID', ''),
            'sms_ir_parameter_name' => 'Code',
            'resend_interval' => 120,
        ];

        foreach ($defaults as $key => $value) {
            if (!SystemSetting::where('group', 'sms')->where('key', $key)->exists()) {
                SystemSetting::create([
                    'group' => 'sms',
                    'key' => $key,
                    'value' => $value,
                    'type' => is_numeric($value) ? 'number' : 'string',
                    'label' => ucfirst(str_replace('_', ' ', $key)),
                    'is_public' => false,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse as this is a fix/add migration
    }
};
