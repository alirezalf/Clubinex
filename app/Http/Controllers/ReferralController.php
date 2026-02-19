<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ReferralNetwork;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // اطمینان از وجود کد معرف
        if (!$user->referral_code) {
            $user->generateReferralCode();
        }

        // آمار شبکه
        $stats = ReferralNetwork::getUserNetworkStats($user->id);
        
        // لیست زیرمجموعه‌ها (مستقیم)
        $referrals = ReferralNetwork::with('referred')
            ->where('referrer_id', $user->id)
            ->latest()
            ->paginate(10);

        $referrals->getCollection()->transform(function ($item) {
            $item->status_text = $item->getStatusText();
            $item->status_color = $item->getStatusColor();
            $item->created_at_jalali = $item->created_at_jalali;
            return $item;
        });
        
        return Inertia::render('Referrals/Index', [
            'referralCode' => $user->referral_code,
            'stats' => $stats,
            'referrals' => $referrals
        ]);
    }
}