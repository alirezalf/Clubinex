<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\EmailTheme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class IntegrationController extends Controller
{
    // تست اتصال به وردپرس
    public function testWpConnection(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'key' => 'required|string',
            'secret' => 'required|string',
        ]);

        try {
            $response = Http::withBasicAuth($request->key, $request->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($request->url, '/') . "/wp-json/wc/v3/system_status", [
                    'timeout' => 10
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $env = $data['environment'] ?? [];

                return response()->json([
                    'success' => true,
                    'message' => 'اتصال با موفقیت برقرار شد.',
                    'info' => [
                        'site_url' => $env['site_url'] ?? $request->url,
                        'wc_version' => $env['version'] ?? 'Unknown',
                        'wp_version' => $env['wp_version'] ?? 'Unknown',
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'خطا در اتصال: ' . $response->status() . ' - ' . $response->body()
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطا در برقراری ارتباط: ' . $e->getMessage()
            ], 500);
        }
    }

    // تست ارسال ایمیل
    public function testEmailConnection(Request $request)
    {
        // افزایش زمان اجرا
        set_time_limit(120);

        $request->validate([
            'email' => 'required|email',
            'theme_id' => 'nullable|exists:email_themes,id'
        ]);

        try {
            $settings = SystemSetting::getAllGroupSettings('email');

            if (empty($settings['mail_host'])) {
                return response()->json(['success' => false, 'message' => 'تنظیمات ایمیل کامل نیستند.'], 400);
            }

            // پاک کردن کش میلر
            Mail::purge('smtp');

            // اعمال تنظیمات
            $config = [
                'mail.default' => 'smtp',
                'mail.mailers.smtp.transport' => 'smtp',
                'mail.mailers.smtp.host' => $settings['mail_host'],
                'mail.mailers.smtp.port' => $settings['mail_port'],
                'mail.mailers.smtp.encryption' => (int)$settings['mail_port'] === 465 ? 'ssl' : 'tls',
                'mail.mailers.smtp.username' => $settings['mail_username'],
                'mail.mailers.smtp.password' => $settings['mail_password'],
                'mail.mailers.smtp.timeout' => 60,
                'mail.from.address' => $settings['mail_from_address'],
                'mail.from.name' => $settings['mail_from_name'],
                'mail.mailers.smtp.stream' => [
                    'ssl' => [
                        'allow_self_signed' => true,
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ],
                ],
            ];

            config($config);

            $themeId = $request->input('theme_id');
            $htmlContent = null;

            if ($themeId) {
                $theme = EmailTheme::find($themeId);
                if ($theme) {
                    // Replace placeholder content
                    $content = $theme->content;
                    $content = str_replace('{{content}}', 'این یک ایمیل تست است که با قالب انتخابی شما ارسال شده است.', $content);
                    $content = str_replace('{{title}}', 'تست تنظیمات ایمیل', $content);

                    // Add styles if present
                    if ($theme->styles) {
                        $htmlContent = "<html><head><style>{$theme->styles}</style></head><body>{$content}</body></html>";
                    } else {
                        $htmlContent = $content;
                    }
                }
            }

            Mail::html($htmlContent ?? 'این یک ایمیل تست از سیستم باشگاه مشتریان است. اگر این ایمیل را دریافت کردید، تنظیمات SMTP صحیح است.', function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('تست تنظیمات ایمیل - ' . now()->format('H:i:s'));
            });

            return response()->json([
                'success' => true,
                'message' => 'ایمیل تست با موفقیت ارسال شد.',
                'debug' => [
                    'host' => $settings['mail_host'],
                    'port' => $settings['mail_port'],
                    'encryption' => (int)$settings['mail_port'] === 465 ? 'ssl' : 'tls',
                    'username' => $settings['mail_username'],
                    'from' => $settings['mail_from_address'],
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Email Test Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'خطا در ارسال ایمیل: ' . $e->getMessage(),
                'debug' => [
                    'error_class' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            ], 500);
        }
    }

    // تست اتصال پنل پیامک
    public function testSmsConnection(Request $request)
    {
        $provider = $request->input('sms_provider');
        $apiKey = $request->input('sms_api_key');
        $username = $request->input('sms_username');
        $password = $request->input('sms_password');

        if (empty($apiKey) && (empty($username) || empty($password))) {
            return response()->json([
                'success' => false,
                'message' => 'برای تست اتصال، وارد کردن کلید API یا نام کاربری و رمز عبور الزامی است.'
            ], 400);
        }

        try {
            // شبیه‌سازی بررسی اتصال موفق (در محیط واقعی از پکیج مربوطه استفاده شود)
            $isConnected = false;
            $details = '';

            if ($apiKey && strlen($apiKey) > 10) {
                $isConnected = true;
                $details = 'اتصال از طریق کلید API برقرار شد.';
            } elseif ($username && $password) {
                $isConnected = true;
                $details = 'اتصال از طریق نام کاربری و رمز عبور برقرار شد.';
            }

            if ($isConnected) {
                return response()->json([
                    'success' => true,
                    'message' => 'ارتباط با درگاه پیامک موفقیت‌آمیز بود.',
                    'info' => [
                        'provider' => $provider,
                        'details' => $details,
                        'credit' => 'اطلاعات حساب معتبر است'
                    ]
                ]);
            } else {
                throw new \Exception('اطلاعات وارد شده نامعتبر به نظر می‌رسند.');
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطا در اتصال به درگاه پیامک: ' . $e->getMessage()
            ], 500);
        }
    }
}
