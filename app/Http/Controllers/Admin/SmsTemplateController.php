<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsTemplate;
use Illuminate\Http\Request;

class SmsTemplateController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'nullable|string',
            'provider_template_id' => 'nullable|string',
        ]);

        SmsTemplate::create($validated);

        return back()->with('message', 'قالب پیامک با موفقیت ایجاد شد.');
    }

    public function update(Request $request, SmsTemplate $smsTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'nullable|string',
            'provider_template_id' => 'nullable|string',
        ]);

        $smsTemplate->update($validated);

        return back()->with('message', 'قالب پیامک با موفقیت بروزرسانی شد.');
    }

    public function destroy(SmsTemplate $smsTemplate)
    {
        $smsTemplate->delete();
        return back()->with('message', 'قالب پیامک با موفقیت حذف شد.');
    }
}
