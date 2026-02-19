<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Club;
use App\Models\PointTransaction;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ClubController extends Controller
{
    /**
     * نمایش لیست باشگاه‌ها و سطوح
     */
    public function index()
    {
        $user = Auth::user();

        // 1. دریافت تمام سطوح اصلی (برای نمایش مسیر پیشرفت)
        $tiers = Club::tiers()
            ->active()
            ->orderBy('min_points')
            ->get()
            ->map(function ($tier) use ($user) {
                // وضعیت کاربر نسبت به این سطح
                $status = 'locked'; // قفل (هنوز نرسیده)

                if ($user->club_id == $tier->id) {
                    $status = 'current'; // سطح فعلی
                } elseif ($user->club && $user->club->min_points > $tier->min_points) {
                    $status = 'passed'; // رد شده (سطح قبلی)
                }

                // محاسبه آیا کاربر می‌تواند به این سطح ارتقا یابد؟
                $isNext = false;
                $canUpgrade = false;

                if ($user->club) {
                    $nextTier = $user->club->getNextTier();
                    if ($nextTier && $nextTier->id == $tier->id) {
                        $isNext = true;
                        $canUpgrade = $user->current_points >= $tier->joining_cost;
                    }
                } else {
                    $firstTier = Club::tiers()->active()->orderBy('min_points')->first();
                    if ($firstTier && $firstTier->id == $tier->id) {
                        $isNext = true;
                        $canUpgrade = $user->current_points >= $tier->joining_cost;
                    }
                }

                return [
                    'id' => $tier->id,
                    'name' => $tier->name,
                    'icon' => $tier->icon,
                    'color' => $tier->color,
                    'min_points' => $tier->min_points,
                    'joining_cost' => $tier->joining_cost,
                    'benefits' => $tier->benefits,
                    'status' => $status,
                    'is_next' => $isNext,
                    'can_upgrade' => $canUpgrade,
                ];
            });

        // 2. دریافت باشگاه‌های ویژه (برای عضویت جانبی)
        $specialClubs = Club::special()
            ->active()
            ->get()
            ->map(function ($club) use ($user) {
                $isMember = $user->memberships->contains($club->id);
                return [
                    'id' => $club->id,
                    'name' => $club->name,
                    'icon' => $club->icon,
                    'color' => $club->color,
                    'benefits' => $club->benefits,
                    'joining_cost' => $club->joining_cost,
                    'is_member' => $isMember,
                    'can_join' => !$isMember && $user->current_points >= $club->joining_cost,
                ];
            });
            
        return Inertia::render('Clubs/Index', [
            'tiers' => $tiers,
            'specialClubs' => $specialClubs,
            'userPoints' => $user->current_points ?? 0, 
            'currentClub' => $user->club
        ]);
    }

    /**
     * عضویت در باشگاه‌های ویژه (غیر سطحی)
     */
    public function join(Request $request, Club $club)
    {
        $user = Auth::user();

        if ($club->is_tier) {
            return back()->with('error', 'برای تغییر سطح از گزینه ارتقا استفاده کنید.');
        }

        if ($user->memberships->contains($club->id)) {
            return back()->with('error', 'شما قبلاً عضو این باشگاه شده‌اید.');
        }

        $cost = $club->joining_cost;

        if ($user->current_points < $cost) {
            return back()->with('error', 'امتیاز شما برای عضویت در این باشگاه کافی نیست.');
        }

        try {
            DB::beginTransaction();

            if ($cost > 0) {
                PointTransaction::deductPoints(
                    $user->id,
                    $cost,
                    null,
                    "عضویت در باشگاه ویژه: {$club->name}",
                    $club
                );
            }

            $user->memberships()->attach($club->id);

            ActivityLog::log(
                'club.joined_special',
                "کاربر در باشگاه ویژه {$club->name} عضو شد",
                [
                    'user_id' => $user->id,
                    'model_type' => Club::class,
                    'model_id' => $club->id
                ]
            );

            DB::commit();

            return back()->with('message', "تبریک! شما به باشگاه {$club->name} پیوستید.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در عملیات عضویت.');
        }
    }

    /**
     * ارتقای سطح اصلی کاربر (Level Up)
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'club_id' => 'required|exists:clubs,id',
        ]);

        $user = Auth::user();
        $targetClubId = $request->input('club_id'); 

        $targetClub = Club::tiers()->findOrFail($targetClubId);
        $currentClub = $user->club;

        if ($currentClub && $targetClub->min_points <= $currentClub->min_points) {
            return back()->with('error', 'امکان بازگشت به سطوح قبلی وجود ندارد.');
        }

        $cost = $targetClub->joining_cost;

        if ($user->current_points < $cost) {
            return back()->with('error', 'امتیاز شما برای ارتقا به این سطح کافی نیست.');
        }

        try {
            DB::beginTransaction();

            PointTransaction::deductPoints(
                $user->id,
                $cost,
                null,
                "ارتقا به سطح {$targetClub->name}",
                $targetClub
            );

            $oldClubName = $currentClub ? $currentClub->name : 'بدون سطح';
            $user->update(['club_id' => $targetClub->id]);

            ActivityLog::log(
                'club.upgraded',
                "کاربر سطح خود را از {$oldClubName} به {$targetClub->name} ارتقا داد",
                [
                    'user_id' => $user->id,
                    'model_type' => Club::class,
                    'model_id' => $targetClub->id,
                    'cost' => $cost
                ]
            );

            DB::commit();

            return back()->with('message', "تبریک! شما به سطح {$targetClub->name} ارتقا یافتید.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در ارتقای سطح: ' . $e->getMessage());
        }
    }
}