<?php

namespace App\Http\Controllers;

use App\Models\LuckyWheel;
use App\Models\LuckyWheelSpin;
use App\Services\LuckyWheelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LuckyWheelController extends Controller
{
    protected $wheelService;

    public function __construct(LuckyWheelService $wheelService)
    {
        $this->wheelService = $wheelService;
    }

    public function index()
    {
        $user = auth()->user();

        // دریافت گردونه فعال (برای نمایش در فرانت)
        $wheel = LuckyWheel::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', now());
            })
            ->with(['prizes' => function($q) {
                $q->where('is_active', true);
            }])
            ->first();

        // دریافت تاریخچه چرخش‌ها
        $history = LuckyWheelSpin::with('prize')
            ->where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($spin) {
                return [
                    'id' => $spin->id,
                    'prize_title' => $spin->prize ? $spin->prize->title : 'آیتم حذف شده',
                    'prize_type' => $spin->prize ? $spin->prize->type : 'unknown',
                    'is_win' => $spin->is_win,
                    'created_at_jalali' => $spin->created_at_jalali,
                    'redemption_status' => $spin->redemption ? $spin->redemption->status : null,
                    'redemption_status_farsi' => $spin->redemption ? $spin->redemption->status_farsi : null,
                ];
            });

        return Inertia::render('LuckyWheel/Index', [
            'wheel' => $wheel,
            'userPoints' => (int) $user->current_points,
            'spinHistory' => $history
        ]);
    }

    public function spin(Request $request)
    {
        try {
            $result = $this->wheelService->spin($request->user());
            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}