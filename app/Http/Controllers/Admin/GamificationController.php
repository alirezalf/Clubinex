<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LuckyWheel;
use App\Models\LuckyWheelPrize;
use App\Models\Survey;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class GamificationController extends Controller
{
    public function index()
    {
        $wheel = LuckyWheel::with('prizes')->firstOrCreate(
            ['is_active' => true],
            ['title' => 'گردونه اصلی', 'cost_per_spin' => 50]
        );

        if(!$wheel->relationLoaded('prizes')) {
            $wheel->load('prizes');
        }

        $surveys = Survey::withCount(['answers as participants_count' => function ($query) {
            $query->select(DB::raw('count(distinct user_id)'));
        }])
        ->withCount('questions')
        ->withSum('questions', 'points')
        ->latest()
        ->get()
        ->map(function($survey) {
            $survey->starts_at_jalali = $survey->starts_at_jalali;
            $survey->ends_at_jalali = $survey->ends_at_jalali;
            return $survey;
        });

        return Inertia::render('Admin/Gamification/Index', [
            'wheel' => $wheel,
            'surveys' => $surveys
        ]);
    }

    public function storeWheelPrize(Request $request)
    {
        $validated = $request->validate([
            'lucky_wheel_id' => 'required|exists:lucky_wheels,id',
            'title' => 'required|string',
            'probability' => 'required|integer|min:0|max:100',
            'type' => 'required|in:points,item,empty,retry',
            'value' => 'required|integer|min:0',
            'stock' => 'nullable|integer',
        ]);

        $prize = LuckyWheelPrize::create($validated);

        ActivityLog::log('wheel.prize_added', "آیتم {$prize->title} به گردونه اضافه شد", [
            'admin_id' => auth()->id(),
            'model_id' => $prize->id,
            'action_group' => 'wheel'
        ]);

        return back()->with('message', 'آیتم جدید به گردونه اضافه شد.');
    }

    public function updateWheelPrize(Request $request, $id)
    {
        $prize = LuckyWheelPrize::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string',
            'probability' => 'required|integer|min:0',
            'type' => 'required|in:points,item,empty,retry',
            'value' => 'required|integer|min:0',
            'stock' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        $prize->update($validated);

        return back()->with('message', 'آیتم گردونه بروزرسانی شد.');
    }

    public function destroyWheelPrize($id)
    {
        $prize = LuckyWheelPrize::findOrFail($id);
        $prize->delete();

        return back()->with('message', 'آیتم گردونه حذف شد.');
    }
}