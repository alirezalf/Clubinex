<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\PointTransaction;
use App\Models\Club;
use App\Models\User;
use App\Models\ProductSerial;
use App\Models\LuckyWheelSpin;
use App\Services\RewardService;
use App\Http\Requests\Admin\Reward\StoreRewardRequest;
use App\Http\Requests\Admin\Reward\UpdateRewardRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Morilog\Jalali\Jalalian;

class RewardController extends Controller
{
    protected $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function index(Request $request)
    {
        $tab = $request->input('tab', 'list'); // 'list' or 'redemptions'
        $filters = $request->only(['search', 'status', 'date_from', 'date_to']);

        $rewards = [];
        $redemptions = [];
        $clubs = Club::select('id', 'name')->get();

        if ($tab === 'list') {
            $rewards = Reward::with('club')->latest()->paginate(10)->withQueryString();
        } else {
            $query = RewardRedemption::with(['user', 'reward', 'admin', 'spin.prize']);

            if ($request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('tracking_code', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($u) use ($search) {
                          $u->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('mobile', 'like', "%{$search}%");
                      })
                      ->orWhereHas('reward', function ($r) use ($search) {
                          $r->where('title', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $redemptions = $query->latest()
                ->paginate(15)
                ->withQueryString();

            $redemptions->getCollection()->transform(function ($item) {
                $item->status_farsi = $item->status_farsi;
                $item->created_at_jalali = $item->created_at_jalali;
                $item->admin_name = $item->admin ? ($item->admin->first_name . ' ' . $item->admin->last_name) : null;

                if ($item->reward) {
                    $item->reward_title = $item->reward->title;
                    $item->reward_type = $item->reward->type;
                } elseif ($item->spin && $item->spin->prize) {
                    $item->reward_title = $item->spin->prize->title . ' (گردونه)';
                    $item->reward_type = 'item';
                } else {
                    $item->reward_title = 'نامشخص / حذف شده';
                    $item->reward_type = 'unknown';
                }

                return $item;
            });
        }

        $counts = [
            'rewards' => Reward::count(),
            'redemptions' => RewardRedemption::where('status', 'pending')->count(),
            'redemptions_total' => RewardRedemption::count(),
        ];

        return Inertia::render('Admin/Rewards/Index', [
            'tab' => $tab,
            'rewards' => $rewards,
            'redemptions' => $redemptions,
            'clubs' => $clubs,
            'filters' => $filters,
            'counts' => $counts
        ]);
    }

    public function store(StoreRewardRequest $request)
    {
        $validated = $request->validated();
        $this->rewardService->createReward($validated, $request->file('image'));

        return redirect()->route('admin.rewards.index', ['tab' => 'list'])->with('message', 'جایزه با موفقیت ایجاد شد.');
    }

    public function update(UpdateRewardRequest $request, $id)
    {
        $validated = $request->validated();
        $this->rewardService->updateReward($id, $validated, $request->file('image'));

        return back()->with('message', 'جایزه بروزرسانی شد.');
    }
    
    public function destroy($id)
    {
        $this->rewardService->deleteReward($id);
        return back()->with('message', 'جایزه حذف شد.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,rejected',
            'admin_note' => 'nullable|string',
            'tracking_code' => 'nullable|string'
        ]);

        try {
            $this->rewardService->updateRedemptionStatus(
                $id, 
                $request->status, 
                $request->admin_note, 
                $request->tracking_code, 
                auth()->id()
            );
            
            return back()->with('message', 'وضعیت درخواست با موفقیت تغییر کرد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در تغییر وضعیت: ' . $e->getMessage());
        }
    }

    public function userHistory(Request $request, $id)
    {
        $user = User::with(['province', 'city', 'club'])->findOrFail($id);
        $from = $request->input('from', 'rewards');

        $stats = [
            'total_earned' => PointTransaction::where('user_id', $id)->where('type', 'earn')->sum('amount'),
            'total_spent' => abs(PointTransaction::where('user_id', $id)->where('type', 'spend')->sum('amount')),
            'today_earned' => PointTransaction::where('user_id', $id)->where('type', 'earn')->whereDate('created_at', today())->sum('amount'),
            'today_spent' => abs(PointTransaction::where('user_id', $id)->where('type', 'spend')->whereDate('created_at', today())->sum('amount')),
        ];

        $transactions = PointTransaction::where('user_id', $id)
            ->latest()
            ->paginate(10, ['*'], 'trans_page')
            ->through(function ($tx) {
                $tx->created_at_jalali = $tx->created_at_jalali;
                $tx->type_farsi = $tx->getTypeFarsi();
                return $tx;
            });

        $rewards = RewardRedemption::with('reward')
            ->where('user_id', $id)
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'title' => $r->reward ? $r->reward->title : 'جایزه گردونه',
                    'points' => $r->points_spent,
                    'status' => $r->status_farsi,
                    'date' => $r->created_at_jalali,
                ];
            });

        $products = ProductSerial::with('product')
            ->where('used_by', $id)
            ->latest('used_at')
            ->get()
            ->map(function ($p) {
                return [
                    'title' => $p->product->title,
                    'serial' => $p->serial_code,
                    'date' => $p->used_at ? Jalalian::fromDateTime($p->used_at)->format('Y/m/d') : '-',
                ];
            });

        $spins = LuckyWheelSpin::with('prize')
            ->where('user_id', $id)
            ->latest()
            ->paginate(10, ['*'], 'spins_page')
            ->through(function ($s) {
                return [
                    'prize' => $s->prize ? $s->prize->title : 'حذف شده',
                    'is_win' => $s->is_win,
                    'cost' => $s->cost_paid,
                    'date' => $s->created_at_jalali,
                ];
            });

        return Inertia::render('Admin/Rewards/UserHistory', [
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'mobile' => $user->mobile,
                'national_code' => $user->national_code ?? '---',
                'address' => $user->full_address,
                'club' => $user->club ? $user->club->name : 'بدون سطح',
                'current_points' => $user->current_points,
            ],
            'stats' => $stats,
            'transactions' => $transactions,
            'rewards' => $rewards,
            'products' => $products,
            'spins' => $spins,
            'from' => $from
        ]);
    }
}