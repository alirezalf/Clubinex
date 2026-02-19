<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\NotificationTemplate;
use App\Models\EmailTheme;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        // دریافت تمام تنظیمات گروه‌بندی شده
        $settings = SystemSetting::all()->groupBy('group');
        
        // دریافت قالب‌های پیام
        $notificationTemplates = NotificationTemplate::with('emailTheme')->get();

        // دریافت تم‌های ایمیل (اصلاح برای نمایش در لیست)
        $emailThemes = EmailTheme::latest()->get();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
            'notificationTemplates' => $notificationTemplates,
            'emailThemes' => $emailThemes // ارسال تم‌ها به فرانت
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except(['_token']);

        foreach ($data as $key => $value) {
            if ($request->hasFile($key)) {
                $file = $request->file($key);
                $path = $file->store('public/settings');
                $value = Storage::url($path);
            }

            if ($value === null && !$request->hasFile($key)) {
                continue; 
            }

            SystemSetting::setValue(
                'general', 
                $key,
                $value
            );
        }

        cache()->forget('global_settings');

        return back()->with('message', 'تنظیمات با موفقیت ذخیره شد.');
    }
    
    // --- متدهای مدیریت تم‌های ایمیل ---

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
        
        // بررسی وابستگی‌ها
        if ($theme->templates()->count() > 0) {
            return back()->with('error', 'این تم به برخی رویدادها متصل است و نمی‌توان آن را حذف کرد.');
        }

        $theme->delete();

        return back()->with('message', 'تم ایمیل حذف شد.');
    }

    // ------------------------------------

    public function logs(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhere('action', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($q2) use ($request) {
                      $q2->where('first_name', 'like', "%{$request->search}%")
                         ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        $logs = $query->latest()->paginate(20)->withQueryString();
            
        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }
}