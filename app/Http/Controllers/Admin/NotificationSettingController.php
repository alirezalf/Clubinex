<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    public function update(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);
        
        $validated = $request->validate([
            'sms_active' => 'boolean',
            'sms_pattern' => 'nullable|string',
            'email_active' => 'boolean',
            'email_subject' => 'nullable|string',
            'email_body' => 'nullable|string',
            'email_theme_id' => 'nullable|exists:email_themes,id', // اضافه شد
            'database_active' => 'boolean',
            'database_message' => 'nullable|string',
        ]);

        $template->update($validated);

        return back()->with('message', 'تنظیمات قالب پیام با موفقیت بروزرسانی شد.');
    }
}