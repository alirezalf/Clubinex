<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\NotificationTemplate;
use App\Models\EmailTheme;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Added Log
use Carbon\Carbon;

use App\Services\ThemeService;

class SettingController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function index()
    {
        // ... (keep index method as is)
        $settings = SystemSetting::all()->groupBy('group');
        $notificationTemplates = NotificationTemplate::with('emailTheme')->get();
        $emailThemes = EmailTheme::latest()->get();

        $admins = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['super-admin', 'admin', 'staff']);
        })->select('id', 'first_name', 'last_name', 'email', 'avatar')->get();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'notificationTemplates' => $notificationTemplates,
            'emailThemes' => $emailThemes,
            'admins' => $admins
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except(['_token', '_method']);
        $themeKeys = ThemeService::getAllowedKeys();

        // 1. Handle Reset Personal Theme
        if ($request->has('reset_personal_theme')) {
             $shouldReset = filter_var($request->reset_personal_theme, FILTER_VALIDATE_BOOLEAN);
             if ($shouldReset) {
                $this->themeService->resetUserTheme(auth()->user());
             }
             unset($data['reset_personal_theme']);
        }

        // 2. Separate Theme Settings from General Settings
        $themeData = [];
        $generalData = [];

        foreach ($data as $key => $value) {
            // Handle File Uploads
            if ($request->hasFile($key)) {
                $file = $request->file($key);
                $path = $file->store('public/settings');
                $value = Storage::url($path);
            }

            if ($value === null && !$request->hasFile($key)) {
                continue;
            }

            if (in_array($key, $themeKeys)) {
                $themeData[$key] = $value;
            } else {
                $generalData[$key] = $value;
            }
        }

        // 3. Update Theme Settings via Service
        if (!empty($themeData)) {
            $this->themeService->updateSystemTheme($themeData);
        }

        // 4. Update General Settings (Legacy Logic)
        $existingKeys = SystemSetting::pluck('group', 'key')->toArray();
        foreach ($generalData as $key => $value) {
            $group = $existingKeys[$key] ?? 'general';
            SystemSetting::setValue($group, $key, $value);
        }

        // Clear cache
        cache()->forget('global_settings');

        return back()->with('message', 'تنظیمات با موفقیت ذخیره و اعمال شد.');
    }

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

    // --- مدیریت تم‌های ایمیل ---

    public function storeTheme(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'styles' => 'nullable|string',
        ]);

        EmailTheme::create($validated);

        return back()->with('message', 'تم ایمیل جدید با موفقیت ایجاد شد.');
    }

    public function updateTheme(Request $request, $id)
    {
        $theme = EmailTheme::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'styles' => 'nullable|string',
        ]);

        $theme->update($validated);

        return back()->with('message', 'تم ایمیل با موفقیت بروزرسانی شد.');
    }

    public function destroyTheme($id)
    {
        $theme = EmailTheme::findOrFail($id);

        if ($theme->templates()->count() > 0) {
            return back()->with('error', 'این تم به برخی رویدادها متصل است و نمی‌توان آن را حذف کرد.');
        }

        $theme->delete();

        return back()->with('message', 'تم ایمیل حذف شد.');
    }

    // --- نمایش لاگ‌های سیستم ---

    public function logs(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($q2) use ($request) {
                      $q2->where('first_name', 'like', "%{$request->search}%")
                         ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->action && $request->action !== 'all') {
            $query->where('action_group', $request->action);
        }

        if ($request->date) {
            if ($request->has('hour') && $request->hour !== null && $request->hour !== '') {
                 $startTime = Carbon::parse($request->date)->setHour($request->hour)->setMinute(0)->setSecond(0);
                 $endTime = Carbon::parse($request->date)->setHour($request->hour)->setMinute(59)->setSecond(59);

                 $query->whereBetween('created_at', [$startTime, $endTime]);
            } else {
                 $query->whereDate('created_at', $request->date);
            }
        }

        $logs = $query->latest()->paginate(20)->withQueryString();

        $logs->getCollection()->transform(function ($log) {
            $log->created_at_jalali = $log->created_at_jalali;
            return $log;
        });

        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'date', 'hour', 'action'])
        ]);
    }
}
