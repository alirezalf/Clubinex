<?php

namespace App\Services\SMS;

use App\Services\SMS\Drivers\SmsIrDriver;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Log;

class SmsManager
{
    public function driver(?string $driver = null): SmsProviderInterface
    {
        $driver = $driver ?? SystemSetting::getValue('sms', 'sms_provider', 'smsir');

        // Normalize driver name (handle cases where URL might be saved)
        if (str_contains($driver, 'sms.ir') || str_contains($driver, 'sms_ir')) {
            $driver = 'smsir';
        }

        switch ($driver) {
            case 'smsir':
                return new SmsIrDriver();
            // Add other drivers here
            default:
                Log::warning("SMS Driver [$driver] not supported. Defaulting to SmsIrDriver.");
                return new SmsIrDriver();
        }
    }
}
