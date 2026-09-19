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
            if (empty($this->merchantId) || str_contains($this->merchantId, 'xxxxxxxx')) {
                Log::error('Zarinpal merchant_id is not configured or is placeholder.');
                return [
                    'success' => false,
                    'message' => 'شناسه پذیرنده درگاه پرداخت تنظیم نشده است. لطفاً از بخش تنظیمات درگاه، شناسه صحیح را وارد کنید.'
                ];
            }

            $response = Http::timeout(15)->post($this->getBaseUrl() . 'request.json', [
                'merchant_id' => $this->merchantId,
                'amount' => $amount,
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

            $errorCode = $result['data']['code'] ?? null;
            $errorMessage = match($errorCode) {
                -1 => 'پارامترهای ارسال شده ناقص هستند.',
                -2 => 'پذیرنده یافت نشد (شناسه پذیرنده نامعتبر است).',
                -3 => 'حساب پذیرنده غیرفعال است.',
                -4 => 'شناسه پذیرنده معتبر نیست.',
                -5 => 'پرداخت با این سقف امکان‌پذیر نیست.',
                -6 => 'سطوح تخفیف پرداخت معتبر نیست.',
                -7 => 'آدرس بازگشت نامعتبر است.',
                -8 => 'توضیحات بیش از حدمجاز است (حداکثر ۲۵۶ کاراکتر).',
                -9 => 'مبلغ پرداخت باید حداقل یک میلیون ریال (۱۰۰ هزار تومان) باشد.',
                -10 => 'پذیرنده فقط می‌تواند با یک مرچنت‌کد فعال باشد.',
                -11 => 'درخواست تکراری است.',
                -12 => 'عملیات پرداخت قبلاً انجام شده است.',
                -13 => 'پیکربندی پذیرنده نامعتبر است.',
                -14 => 'پذیرنده سندی پشتیبانی نمی‌کند.',
                -15 => 'پذیرنده فقط می‌تواند با سند پشتیبانی کند.',
                -16 => 'پرداخت قبلاً تایید شده است.',
                -17 => 'پرداخت هنوز تایید نشده است.',
                -18 => 'عملیات پرداخت با خطا مواجه شد.',
                -19 => 'پرداخت منقضی شده است.',
                -20 => 'خطای احراز هویت رمز پذیرنده.',
                -21 => 'خطا در دریافت مبلغ پرداختی.',
                -22 => 'خطای سیستمی. لطفاً مجدداً تلاش کنید.',
                default => 'خطای ناشناخته (کد: ' . ($errorCode ?? 'نامشخص') . ')'
            };

            Log::error('Zarinpal request failed', ['code' => $errorCode, 'message' => $errorMessage, 'raw' => $result]);
            return [
                'success' => false,
                'message' => $errorMessage
            ];

        } catch (\Exception $e) {
            Log::error('Zarinpal Exception: ' . $e->getMessage());
            $userMessage = 'خطا در ارتباط با درگاه پرداخت.';
            if ($e instanceof \Illuminate\Http\Client\ConnectionException) {
                $userMessage = 'اتصال با سرور درگاه پرداخت برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش کنید.';
            }
            return [
                'success' => false,
                'message' => $userMessage
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
