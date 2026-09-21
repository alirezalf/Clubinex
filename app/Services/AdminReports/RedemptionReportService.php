<?php

namespace App\Services\AdminReports;

use App\Models\RewardRedemption;
use Illuminate\Http\Request;

class RedemptionReportService
{
    public function getRedemptions(Request $request)
    {
        $query = RewardRedemption::with(['user', 'reward'])->latest();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('user', function ($uq) use ($request) {
                    $uq->where('mobile', 'like', "%{$request->search}%")
                      ->orWhere('first_name', 'like', "%{$request->search}%")
                      ->orWhere('last_name', 'like', "%{$request->search}%");
                })->orWhere('tracking_code', 'like', "%{$request->search}%");
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($r) {
            $r->status_farsi = $r->status_farsi;
            $r->created_at_jalali = $r->created_at_jalali;
            return $r;
        });

        return $data;
    }
}
