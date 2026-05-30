<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected $merchantId;
    protected $sandbox;

    public function __construct()
    {
        $this->merchantId = \App\Models\SystemSetting::getValue('payment', 'payment_merchant_id', env('ZARINPAL_MERCHANT_ID', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'));
        $this->sandbox = filter_var(\App\Models\SystemSetting::getValue('payment', 'payment_sandbox', env('ZARINPAL_SANDBOX', true)), FILTER_VALIDATE_BOOLEAN);
    }

    protected function getBaseUrl()
    {
        return $this->sandbox
            ? 'https://sandbox.zarinpal.com/pg/v4/payment/'
            : 'https://api.zarinpal.com/pg/v4/payment/';
    }

    protected function getStartPayUrl($authority)
    {
        return $this->sandbox
            ? "https://sandbox.zarinpal.com/pg/StartPay/" . $authority
            : "https://www.zarinpal.com/pg/StartPay/" . $authority;
    }

    public function requestPayment($amount, $description, $callbackUrl, $mobile = '', $email = '')
    {
        try {
            $response = Http::post($this->getBaseUrl() . 'request.json', [
                'merchant_id' => $this->merchantId,
                'amount' => $amount, // Amount in Toman or Rial based on setting, Zarinpal normally uses Rial but v4 uses Rial by default, some prefer Toman. let's assume Rial.
                'description' => $description,
                'callback_url' => $callbackUrl,
                'metadata' => [
                    'mobile' => $mobile,
                    'email' => $email,
                ],
            ]);

            $result = $response->json();

            if (isset($result['data']['code']) && $result['data']['code'] == 100) {
                return [
                    'success' => true,
                    'authority' => $result['data']['authority'],
                    'payment_url' => $this->getStartPayUrl($result['data']['authority']),
                ];
            }

            Log::error('Zarinpal request failed: ' . json_encode($result));
            return [
                'success' => false,
                'message' => 'ارتباط با درگاه پرداخت برقرار نشد.',
                'error' => $result['errors'] ?? 'Unknown Error'
            ];

        } catch (\Exception $e) {
            Log::error('Zarinpal Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'خطا در ارتباط با درگاه پرداخت.'
            ];
        }
    }

    public function verifyPayment($amount, $authority)
    {
        try {
            $response = Http::post($this->getBaseUrl() . 'verify.json', [
                'merchant_id' => $this->merchantId,
                'amount' => $amount,
                'authority' => $authority,
            ]);

            $result = $response->json();

            if (isset($result['data']['code']) && ($result['data']['code'] == 100 || $result['data']['code'] == 101)) {
                return [
                    'success' => true,
                    'ref_id' => $result['data']['ref_id'],
                    'code' => $result['data']['code']
                ];
            }

            return [
                'success' => false,
                'message' => 'پرداخت ناموفق بود یا تایید نشد.',
                'code' => $result['data']['code'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error('Zarinpal Verify Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'خطا در تایید تراکنش.'
            ];
        }
    }
}
