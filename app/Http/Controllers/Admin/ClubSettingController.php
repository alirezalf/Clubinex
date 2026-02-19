<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\PointRule;
use App\Models\SystemSetting;
use App\Models\ActivityLog;
use App\Models\LuckyWheel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ClubSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Club/Settings', [
            // مرتب‌سازی: اول سطوح (is_tier = 1) سپس اتاق‌ها (is_tier = 0)
            // درون هر گروه بر اساس حداقل امتیاز
            'clubs' => Club::orderBy('is_tier', 'desc')
                        ->orderBy('min_points', 'asc')
                        ->get(),
            // فیلتر کردن قوانین مربوط به بازی‌ها و نظرسنجی‌ها (چون در بخش مدیریت بازی هستند)
            // اما گردونه شانس باید نمایش داده شود
            'rules' => PointRule::where(function($q) {
                $q->whereNotIn('action_code', ['quiz_participation', 'poll_participation'])
                  ->orWhere('action_code', 'lucky_wheel_spin');
            })->orderBy('id')->get(),
        ]);
    }

    public function storeClub(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => [
                'required', 
                'string', 
                // نادیده گرفتن رکوردهای حذف شده هنگام بررسی یکتایی
                Rule::unique('clubs')->whereNull('deleted_at')
            ],
            'min_points' => 'required|integer|min:0',
            'max_points' => 'nullable|integer|gt:min_points',
            'joining_cost' => 'nullable|integer|min:0',
            'color' => 'required|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // اعتبارسنجی تصویر
            'is_tier' => 'boolean', 
            'benefits' => 'nullable|array', 
            'benefits.*' => 'string|max:255'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('public/clubs');
            $validated['image'] = Storage::url($path);
        }

        $club = Club::create($validated);

        ActivityLog::log('club.created', "باشگاه جدید {$club->name} ایجاد شد", [
            'admin_id' => auth()->id(),
            'model_id' => $club->id
        ]);

        return back()->with('message', 'باشگاه جدید ایجاد شد.');
    }

    public function updateClub(Request $request, $id)
    {
        $club = Club::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string',
            'min_points' => 'required|integer',
            'max_points' => 'nullable|integer',
            'joining_cost' => 'nullable|integer|min:0',
            'color' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'is_tier' => 'boolean', 
            'benefits' => 'nullable|array', 
            'benefits.*' => 'string|max:255'
        ]);

        if ($request->hasFile('image')) {
            // حذف تصویر قبلی اگر وجود دارد (اختیاری)
            // if ($club->image) { Storage::delete(...) }
            
            $path = $request->file('image')->store('public/clubs');
            $validated['image'] = Storage::url($path);
        }

        $club->update($validated);

        return back()->with('message', 'سطح باشگاه با موفقیت بروزرسانی شد.');
    }

    public function destroyClub($id)
    {
        $club = Club::findOrFail($id);
        
        // 1. بررسی اعضا
        // بررسی کاربرانی که این باشگاه سطح اصلی آن‌هاست
        $usersCount = $club->users()->count();
        // بررسی کاربرانی که عضویت جانبی در این باشگاه دارند
        $membersCount = $club->members()->count();

        if ($usersCount > 0 || $membersCount > 0) {
            return back()->with('error', "این باشگاه دارای {$usersCount} عضو اصلی و {$membersCount} عضو جانبی است و قابل حذف نیست. می‌توانید آن را غیرفعال کنید.");
        }

        // 2. پاکسازی داده‌های وابسته غیرمهم (مثل درخواست‌های عضویت قدیمی)
        // اگر درخواست‌های عضویت وجود داشته باشد، ممکن است مانع حذف شود (Constraint Violation)
        // بنابراین آن‌ها را حذف می‌کنیم (چون باشگاه خالی است، این درخواست‌ها ارزشی ندارند)
        $club->clubRegistrations()->delete();

        // 3. حذف باشگاه
        $club->delete();

        ActivityLog::log('club.deleted', "باشگاه {$club->name} حذف شد", [
            'admin_id' => auth()->id(),
            'model_id' => $id
        ]);

        return back()->with('message', 'باشگاه با موفقیت حذف شد.');
    }

    public function updateRule(Request $request, $id)
    {
        $rule = PointRule::findOrFail($id);
        
        $validated = $request->validate([
            'points' => 'required|integer',
            'is_active' => 'boolean',
            'title' => 'required|string'
        ]);

        $rule->update($validated);

        // اگر قانون مربوط به گردونه شانس بود، تنظیمات گردونه را هم آپدیت کن
        if ($rule->action_code === 'lucky_wheel_spin') {
            // هزینه در PointRule معمولا منفی است (کسر امتیاز)، اما در LuckyWheel مثبت ذخیره می‌شود
            $cost = abs($validated['points']);
            LuckyWheel::where('is_active', true)->update(['cost_per_spin' => $cost]);
        }

        return back()->with('message', 'قانون امتیازدهی تغییر کرد.');
    }
}