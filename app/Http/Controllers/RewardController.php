<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Services\RewardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RewardController extends Controller
{
    protected $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function index()
    {
        $user = auth()->user();
        $points = $user ? (int) $user->current_points : 0;

        $rewards = Reward::where('is_active', true)
            ->with('club')
            ->orderBy('points_cost', 'asc')
            ->get()
            ->map(function ($reward) use ($user) {
                return array_merge($reward->toArray(), [
                    'can_redeem' => $user ? $reward->canUserRedeem($user) : false
                ]);
            });

        $myRedemptions = $user ? RewardRedemption::where('user_id', $user->id)
            ->with('reward')
            ->latest()
            ->get()
            ->map(function ($r) {
                $r->status_farsi = $r->status_farsi;
                $r->created_at_jalali = $r->created_at_jalali;
                return $r;
            }) : [];
            
        return Inertia::render('Rewards/Index', [
            'rewards' => $rewards,
            'current_points' => $points, 
            'myRedemptions' => $myRedemptions
        ]);
    }

    public function redeem(Request $request, $id)
    {
        try {
            $this->rewardService->redeemReward(
                auth()->user(), 
                $id, 
                $request->delivery_info
            );

            return back()->with('message', 'درخواست دریافت جایزه با موفقیت ثبت شد.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}