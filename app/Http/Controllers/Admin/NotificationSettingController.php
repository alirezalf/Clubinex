<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|unique:notification_templates',
            'title_fa' => 'required|string',
            'variables' => 'nullable|string',
            'sms_active' => 'boolean',
            'email_active' => 'boolean',
            'database_active' => 'boolean',
        ]);

        NotificationTemplate::create($validated);

        return back()->with('message', 'الگوی اعلان جدید با موفقیت اضافه شد.');
    }

    public function update(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $validated = $request->validate([
            'sms_active' => 'boolean',
            'sms_pattern' => 'nullable|string',
            'sms_template_id' => 'nullable|exists:sms_templates,id',
            'email_active' => 'boolean',
            'email_subject' => 'nullable|string',
            'email_body' => 'nullable|string',
            'email_theme_id' => 'nullable|exists:email_themes,id',
            'database_active' => 'boolean',
            'database_message' => 'nullable|string',
        ]);

        $template->update($validated);

        return back()->with('message', 'تنظیمات قالب پیام با موفقیت بروزرسانی شد.');
    }

    public function destroy($id)
    {
        $template = NotificationTemplate::findOrFail($id);

        if (in_array($template->event_name, ['otp_login', 'welcome_user'])) {
             return back()->with('error', 'حذف این رویداد سیستمی مجاز نیست.');
        }

        $template->delete();

        return back()->with('message', 'الگوی اعلان با موفقیت حذف شد.');
    }
}
