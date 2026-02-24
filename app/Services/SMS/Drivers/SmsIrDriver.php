<?php

namespace App\Services\SMS\Drivers;

use App\Services\SMS\SmsProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\SystemSetting;

class SmsIrDriver implements SmsProviderInterface
{
    protected $apiKey;
    protected $templateId;
    protected $parameterName;

    public function __construct($apiKey = null, $templateId = null, $parameterName = null)
    {
        // 1. Try Constructor Injection (for testing)
        // 2. Try System Settings (DB) - Treat empty strings as null
        // 3. Try Environment Variables (.env) - Support both underscore and hyphen

        $dbApiKey = SystemSetting::getValue('sms', 'sms_api_key');
        Log::info("SmsIrDriver Debug: DB API Key: " . ($dbApiKey ? substr($dbApiKey, 0, 5) . '...' : 'NULL'));

        $this->apiKey = $apiKey
            ?? (!empty($dbApiKey) ? $dbApiKey : (env('SMSIR_API_KEY') ?: env('SMSIR-API-KEY')));

        $dbTemplateId = SystemSetting::getValue('sms', 'sms_ir_template_id');
        if (empty($dbTemplateId)) {
            // Fallback: Check 'general' group or other keys just in case
            $dbTemplateId = SystemSetting::getValue('general', 'sms_ir_template_id');

            if (empty($dbTemplateId)) {
                // Log all SMS settings to see if the key is different
                $allSmsSettings = SystemSetting::getAllGroupSettings('sms');
                Log::info("SmsIrDriver Debug: All SMS Settings in DB: " . json_encode($allSmsSettings));
            }
        }
        Log::info("SmsIrDriver Debug: DB Template ID: " . ($dbTemplateId ?? 'NULL'));

        $this->templateId = $templateId
            ?? (!empty($dbTemplateId) ? $dbTemplateId : (env('SMSIR_TEMPLATE_ID') ?: env('SMSIR-TEMPLATE-ID')));

        $dbParamName = SystemSetting::getValue('sms', 'sms_ir_parameter_name');
        Log::info("SmsIrDriver Debug: DB Param Name: " . ($dbParamName ?? 'NULL'));

        $this->parameterName = $parameterName
            ?? (!empty($dbParamName) ? $dbParamName : 'Code');

        // Log initialization for debugging (masking API key)
        Log::info('SmsIrDriver Initialized', [
            'apiKey_present' => !empty($this->apiKey),
            'apiKey_source' => $apiKey ? 'injection' : (!empty($dbApiKey) ? 'db' : (env('SMSIR_API_KEY') || env('SMSIR-API-KEY') ? 'env' : 'none')),
            'templateId' => $this->templateId,
            'templateId_source' => $templateId ? 'injection' : (!empty($dbTemplateId) ? 'db' : (env('SMSIR_TEMPLATE_ID') || env('SMSIR-TEMPLATE-ID') ? 'env' : 'none')),
            'parameterName' => $this->parameterName,
            'env_template_id' => env('SMSIR_TEMPLATE_ID') ?? env('SMSIR-TEMPLATE-ID') ?? 'NULL'
        ]);
    }

    public function getCredit(): ?float
    {
        if (empty($this->apiKey)) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get('https://api.sms.ir/v1/credit');

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'] ?? null; // Assuming standard response structure
            }

            Log::error('SMS.ir Credit Check Failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('SMS.ir Credit Check Exception: ' . $e->getMessage());
            return null;
        }
    }

    public function sendVerify(string $mobile, string $code, ?string $templateId = null): bool
    {
        $templateId = $templateId ?? $this->templateId;

        // Fallback: If templateId is empty, try to fetch from DB or Env one last time
        if (empty($templateId)) {
            $templateId = SystemSetting::getValue('sms', 'sms_ir_template_id');
            if (empty($templateId)) {
                $templateId = SystemSetting::getValue('general', 'sms_ir_template_id');
            }
            if (empty($templateId)) {
                $templateId = env('SMSIR_TEMPLATE_ID') ?? env('SMSIR-TEMPLATE-ID');
            }

            if (!empty($templateId)) {
                $this->templateId = $templateId; // Update property
                Log::info("SmsIrDriver: Recovered templateId from fallback: $templateId");
            } else {
                 Log::warning("SmsIrDriver: Failed to recover templateId. DB(sms): " . SystemSetting::getValue('sms', 'sms_ir_template_id') . ", DB(general): " . SystemSetting::getValue('general', 'sms_ir_template_id'));
            }
        }

        if (empty($this->apiKey) || empty($templateId)) {
            Log::error('SMS.ir configuration missing: API Key or Template ID not set.', [
                'apiKey_present' => !empty($this->apiKey),
                'templateId' => $templateId,
                'context' => 'sendVerify'
            ]);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'x-api-key' => $this->apiKey,
            ])->post('https://api.sms.ir/v1/send/verify', [
                'mobile' => $mobile,
                'templateId' => (int)$templateId,
                'parameters' => [
                    [
                        'name' => $this->parameterName,
                        'value' => $code
                    ]
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                // SMS.ir usually returns status=1 for success
                if (isset($result['status']) && $result['status'] == 1) {
                    return true;
                }
                Log::error('SMS.ir API Error: ' . ($result['message'] ?? 'Unknown error'), $result);
                return false;
            }

            Log::error('SMS.ir HTTP Error: ' . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error('SMS.ir Exception: ' . $e->getMessage());
            return false;
        }
    }

    public function sendBulk(string $mobile, string $message): bool
    {
        // Implement bulk sending if needed, similar to the existing job logic
        // For now, we focus on verify
        return false;
    }
}
