<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTheme;
use Illuminate\Http\Request;

class EmailThemeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'styles' => 'nullable|string',
        ]);

        EmailTheme::create($validated);

        return back()->with('message', 'تم ایمیل جدید با موفقیت ایجاد شد.');
    }

    public function update(Request $request, $id)
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

    public function destroy($id)
    {
        $theme = EmailTheme::findOrFail($id);

        if ($theme->templates()->count() > 0) {
            return back()->with('error', 'این تم به برخی رویدادها متصل است و نمی‌توان آن را حذف کرد.');
        }

        $theme->delete();

        return back()->with('message', 'تم ایمیل حذف شد.');
    }
}
