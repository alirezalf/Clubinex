<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletWithdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WalletWithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = WalletWithdrawal::with('user:id,first_name,last_name,mobile')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        $withdrawals = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Marketing/Withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function updateStatus(Request $request, WalletWithdrawal $withdrawal)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,paid',
            'admin_note' => 'nullable|string|max:1000'
        ]);

        if ($withdrawal->status !== 'pending' && $withdrawal->status !== 'approved') {
            return back()->with('error', 'وضعیت این درخواست قابل تغییر نیست.');
        }

        DB::transaction(function () use ($withdrawal, $request) {
            $status = $request->status;

            if ($status === 'rejected') {
                // Return amount to wallet balance
                $withdrawal->wallet->increment('balance', $withdrawal->amount);

                // Add wallet transaction to show refunded amount
                $withdrawal->wallet->transactions()->create([
                    'amount' => clone $withdrawal->amount,
                    'type' => 'deposit',
                    'status' => 'success',
                    'description' => 'برگشت وجه به دلیل رد درخواست برداشت وجه',
                ]);
            } else if ($status === 'paid') {
                // Find pending transaction and make it successful
                $pendingTx = $withdrawal->wallet->transactions()
                    ->where('amount', $withdrawal->amount)
                    ->where('type', 'withdrawal')
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
                if ($pendingTx) {
                    $pendingTx->update(['status' => 'success']);
                }
            }

            $withdrawal->update([
                'status' => $status,
                'admin_note' => $request->admin_note
            ]);
        });

        return back()->with('success', 'وضعیت درخواست با موفقیت بروزرسانی شد.');
    }
}
