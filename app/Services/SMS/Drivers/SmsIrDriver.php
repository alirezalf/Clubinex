<?php

namespace App\Services\SMS\Drivers;

use App\Models\SystemSetting;
use App\Services\SMS\SmsProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsIrDriver implements SmsProviderInterface
{
    protected $apiKey;
    protected $templateId;
    protected $parameterName;
    protected $sender;

    public function __construct($apiKey = null, $templateId = null, $parameterName = null, $sender = null)
    {
        $this->apiKey = $apiKey ?: (SystemSetting::getValue('sms', 'sms_api_key') ?: env('SMSIR_API_KEY'));
        $this->templateId = $templateId ?: (SystemSetting::getValue('sms', 'sms_ir_template_id') ?: env('SMSIR_TEMPLATE_ID'));
        $this->parameterName = $parameterName ?: (SystemSetting::getValue('sms', 'sms_ir_parameter_name') ?: 'Code');
        $this->sender = $sender ?: SystemSetting::getValue('sms', 'sms_sender');
    }

    public function getCredit(): ?float
    {
        if (empty($this->apiKey)) return null;

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get('https://api.sms.ir/v1/credit');

            return $response->successful() ? ($response->json('data') ?? null) : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function sendVerifyWithParams(string $mobile, int $templateId, array $parameters): bool
    {
        if (empty($this->apiKey)) return false;

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'text/plain',
                'X-API-KEY' => $this->apiKey,
            ])->post('https://api.sms.ir/v1/send/verify', [
                'mobile' => $mobile,
                'templateId' => $templateId,
                'parameters' => $parameters
            ]);

            return $response->successful() && $response->json('status') == 1;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function sendVerify(string $mobile, string $code, ?string $templateId = null): bool
    {
        $templateId = $templateId ?? $this->templateId;

        if (empty($templateId)) return false;

        return $this->sendVerifyWithParams($mobile, (int)$templateId, [
            [
                'name' => $this->parameterName,
                'value' => $code
            ]
        ]);
    }


public function sendBulk(string $mobile, string $message): bool
{
    if (empty($this->apiKey) || empty($this->sender)) {
        Log::error('SMSIR: API Key or Sender is empty', [
            'apiKey' => !empty($this->apiKey),
            'sender' => !empty($this->sender)
        ]);
        return false;
    }

    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json', // تغییر به application/json
            'X-API-KEY' => $this->apiKey,
        ])->post('https://api.sms.ir/v1/send/bulk', [
            'lineNumber' => $this->sender,
            'MessageText' => $message,
            'Mobiles' => is_array($mobile) ? $mobile : [$mobile],
        ]);

        // لاگ کردن پاسخ برای دیباگ
        Log::info('SMSIR Bulk Response', [
            'status' => $response->status(),
            'body' => $response->json()
        ]);

        if (!$response->successful()) {
            Log::error('SMSIR: HTTP Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;
        }

        $responseData = $response->json();

        // بررسی ساختار پاسخ بر اساس مستندات SMS.ir
        return isset($responseData['status']) && $responseData['status'] == 1;

    } catch (\Exception $e) {
        Log::error('SMSIR Exception in sendBulk', [
            'message' => $e->getMessage(),
            'mobile' => $mobile
        ]);
        return false;
    }
}
}
