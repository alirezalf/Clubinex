<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\SystemSetting;
use App\Models\PointTransaction;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Helpers\SettingsHelper;

class WalletController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index()
    {
        $user = auth()->user();
        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        $transactions = $wallet->transactions()->latest()->paginate(15);
        $totalPoints = $user->current_points;

        // Get Finance Settings
        $financeConfig = [
            'currency' => SystemSetting::getValue('finance', 'currency', 'تومان'),
            'rate' => (float) SystemSetting::getValue('finance', 'point_to_currency_rate', 100),
            'allow_p2w' => SystemSetting::getValue('finance', 'allow_points_to_wallet', '1') == '1',
            'allow_w2p' => SystemSetting::getValue('finance', 'allow_wallet_to_points', '1') == '1',
        ];

        return Inertia::render('Wallet/Index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'points' => $totalPoints,
            'config' => $financeConfig
        ]);
    }

    public function convertPointsToWallet(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1'
        ]);

        $allow = SystemSetting::getValue('finance', 'allow_points_to_wallet', '1') == '1';
        if (!$allow) return back()->with('error', 'امکان تبدیل امتیاز به اعتبار غیرفعال است.');

        $rate = (float) SystemSetting::getValue('finance', 'point_to_currency_rate', 100);
        if ($rate <= 0) return back()->with('error', 'نرخ تبدیل نامعتبر است.');

        $user = auth()->user();
        if ($user->current_points < $request->points) {
            return back()->with('error', 'امتیاز شما کافی نیست.');
        }

        $amount = $request->points * $rate;

        DB::transaction(function () use ($user, $request, $amount) {
            // کسر امتیاز
            $newBalance = $user->current_points - $request->points;
            $user->update(['current_points' => $newBalance]);

            PointTransaction::create([
                'user_id' => $user->id,
                'amount' => $request->points,
                'type' => 'spend',
                'description' => 'تبدیل امتیاز به شارژ کیف پول',
                'balance_after' => $newBalance,
            ]);

            // شارژ کیف پول
            $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
            $wallet->increment('balance', $amount);

            $wallet->transactions()->create([
                'amount' => $amount,
                'type' => 'deposit',
                'status' => 'success',
                'description' => 'شارژ از طریق تبدیل امتیاز',
            ]);
        });

        return back()->with('success', 'امتیاز شما با موفقیت به شارژ کیف پول تبدیل شد.');
    }

    public function convertWalletToPoints(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1'
        ]);

        $allow = SystemSetting::getValue('finance', 'allow_wallet_to_points', '1') == '1';
        if (!$allow) return back()->with('error', 'امکان خرید امتیاز با کیف پول غیرفعال است.');

        $rate = (float) SystemSetting::getValue('finance', 'point_to_currency_rate', 100);
        if ($rate <= 0) return back()->with('error', 'نرخ تبدیل نامعتبر است.');

        $amountToPay = $request->points * $rate;
        $user = auth()->user();

        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
        if ($wallet->balance < $amountToPay) {
            return back()->with('error', 'موجودی کیف پول شما برای این تبدیل کافی نیست.');
        }

        DB::transaction(function () use ($user, $wallet, $request, $amountToPay) {
            // کسر پول
            $wallet->decrement('balance', $amountToPay);
            $wallet->transactions()->create([
                'amount' => clone $amountToPay,
                'type' => 'withdrawal',
                'status' => 'success',
                'description' => 'خرید امتیاز با کیف پول',
            ]);

            // اضافه کردن امتیاز
            $newBalance = $user->current_points + $request->points;
            $user->update(['current_points' => $newBalance]);

            PointTransaction::create([
                'user_id' => $user->id,
                'amount' => $request->points,
                'type' => 'earn',
                'description' => 'خرید امتیاز با اعتبار کیف پول',
                'balance_after' => $newBalance,
            ]);
        });

        return back()->with('success', 'اعتبار کیف پول با موفقیت به امتیاز تبدیل شد.');
    }

    public function charge(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000'
        ]);

        $user = auth()->user();
        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        $transaction = $wallet->transactions()->create([
            'amount' => $request->amount,
            'type' => 'deposit',
            'status' => 'pending',
            'description' => 'شارژ کیف پول'
        ]);

        $callbackUrl = route('wallet.verify', ['transaction' => $transaction->id]);

        $payment = $this->paymentService->requestPayment(
            $request->amount,
            trim('شارژ کیف پول - کاربر ' . $user->full_name),
            $callbackUrl,
            $user->mobile,
            $user->email
        );

        if ($payment['success']) {
            $transaction->update(['reference_id' => $payment['authority']]);
            return Inertia::location($payment['payment_url']);
        }

        return back()->with('error', $payment['message']);
    }

    public function verify(Request $request, WalletTransaction $transaction)
    {
        if ($request->Status !== 'OK') {
            $transaction->update(['status' => 'failed']);
            return redirect()->route('wallet.index')->with('error', 'پرداخت توسط کاربر لغو شد یا ناموفق بود.');
        }

        $payment = $this->paymentService->verifyPayment($transaction->amount, $request->Authority);

        if ($payment['success']) {
            DB::transaction(function () use ($transaction, $payment) {
                $transaction->update([
                    'status' => 'success',
                    'reference_id' => $payment['ref_id']
                ]);

                $transaction->wallet->increment('balance', $transaction->amount);
            });

            return redirect()->route('wallet.index')->with('success', 'کیف پول شما با موفقیت شارژ شد. کد رهگیری: ' . $payment['ref_id']);
        }

        $transaction->update(['status' => 'failed']);
        return redirect()->route('wallet.index')->with('error', $payment['message']);
    }

    public function withdrawRequest(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'bank_name' => 'required|string|max:100',
            'iban_number' => 'nullable|string|max:50',
            'card_number' => 'required|string|size:16',
            'account_holder' => 'required|string|max:100',
        ]);

        $user = auth()->user();
        $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        if ($wallet->balance < $request->amount) {
            return back()->with('error', 'موجودی کیف پول شما برای این برداشت کافی نیست.');
        }

        DB::transaction(function () use ($user, $wallet, $request) {
            // Deduct the requested amount from the wallet to lock it
            $wallet->decrement('balance', $request->amount);

            // Record as pending withdrawal in wallet transactions
            $wallet->transactions()->create([
                'amount' => clone $request->amount,
                'type' => 'withdrawal',
                'status' => 'pending',
                'description' => 'درخواست برداشت وجه از کیف پول',
            ]);

            // Save actual withdrawal request
            \App\Models\WalletWithdrawal::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'amount' => $request->amount,
                'bank_name' => $request->bank_name,
                'iban_number' => $request->iban_number,
                'card_number' => $request->card_number,
                'account_holder' => $request->account_holder,
                'status' => 'pending',
            ]);
        });

        return back()->with('success', 'درخواست برداشت وجه با موفقیت ثبت شد و در انتظار بررسی است.');
    }
}
