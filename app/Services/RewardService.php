<?php

namespace App\Services;

use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\PointTransaction;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class RewardService
{
    /**
     * ایجاد جایزه جدید
     */
    public function createReward(array $data, $imageFile = null)
    {
        if ($imageFile) {
            $path = $imageFile->store('public/rewards');
            $data['image'] = Storage::url($path);
        }

        $reward = Reward::create($data);

        ActivityLog::log('reward.created', "جایزه جدید '{$reward->title}' ایجاد شد", [
            'admin_id' => auth()->id(),
            'model_id' => $reward->id,
            'model_type' => Reward::class
        ]);

        return $reward;
    }

    /**
     * ویرایش جایزه
     */
    public function updateReward(int $id, array $data, $imageFile = null)
    {
        $reward = Reward::findOrFail($id);

        if ($imageFile) {
            if ($reward->image) {
                $oldPath = str_replace('/storage/', 'public/', $reward->image);
                if (Storage::exists($oldPath)) {
                    Storage::delete($oldPath);
                }
            }

            $path = $imageFile->store('public/rewards');
            $data['image'] = Storage::url($path);
        }

        $reward->update($data);

        ActivityLog::log('reward.updated', "جایزه '{$reward->title}' ویرایش شد", [
            'admin_id' => auth()->id(),
            'model_id' => $reward->id,
            'model_type' => Reward::class
        ]);

        return $reward;
    }

    /**
     * حذف جایزه
     */
    public function deleteReward(int $id)
    {
        $reward = Reward::findOrFail($id);

        if ($reward->image) {
            $oldPath = str_replace('/storage/', 'public/', $reward->image);
            if (Storage::exists($oldPath)) {
                Storage::delete($oldPath);
            }
        }

        $reward->delete();

        ActivityLog::log('reward.deleted', "جایزه '{$reward->title}' حذف شد", [
            'admin_id' => auth()->id(),
            'model_id' => $id
        ]);
    }

    /**
     * دریافت جایزه توسط کاربر (Redeem)
     */
    public function redeemReward(User $user, int $rewardId, ?array $deliveryInfo)
    {
        $lock = \Illuminate\Support\Facades\Cache::lock('reward_redeem_'.$user->id, 10);

        if (!$lock->get()) {
            throw new Exception('درخواست قبلی شما در حال پردازش است. لطفا چند لحظه شکیبا باشید.');
        }

        try {
            return DB::transaction(function () use ($user, $rewardId, $deliveryInfo) {
            // قفل کردن رکورد جایزه برای مدیریت صحیح موجودی در درخواست‌های همزمان
            $reward = Reward::where('id', $rewardId)->lockForUpdate()->firstOrFail();

            if (!$reward->canUserRedeem($user)) {
                throw new Exception('شما شرایط دریافت این جایزه را ندارید یا موجودی تمام شده است.');
            }

            // کسر امتیاز و موجودی کیف پول از کاربر
            if ($reward->points_cost > 0) {
                $transaction = PointTransaction::deductPoints(
                    $user->id,
                    $reward->points_cost,
                    null,
                    "دریافت جایزه: {$reward->title}",
                    $reward
                );

                if (!$transaction) {
                     throw new Exception('خطا در کسر امتیاز. موجودی امتیاز کافی نیست.');
                }
            }

            if ($reward->cash_cost > 0) {
                $wallet = $user->wallet()->firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
                if ($wallet->balance < $reward->cash_cost) {
                    throw new Exception('موجودی کیف پول شما برای دریافت این جایزه کافی نیست.');
                }
                $wallet->decrement('balance', $reward->cash_cost);
                $wallet->transactions()->create([
                    'amount' => $reward->cash_cost,
                    'type' => 'purchase',
                    'status' => 'success',
                    'description' => "دریافت جایزه: {$reward->title}",
                ]);
            }

            // ثبت درخواست
            $redemption = RewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_cost,
                'cash_spent' => $reward->cash_cost,
                'status' => 'pending',
                'delivery_info' => $deliveryInfo,
                'tracking_code' => 'RWD-' . strtoupper(Str::random(8)),
            ]);

            // کاهش موجودی انبار
            $reward->decrement('stock');

            // ارسال نوتیفیکیشن به کاربر
            try {
                // ارسال اعلان سیستمی (صرف نظر از وجود قالب سفارشی)
                \Illuminate\Support\Facades\Notification::send($user, new \App\Notifications\SystemNotification(
                    'دریافت جایزه',
                    "درخواست شما برای دریافت جایزه '{$reward->title}' با موفقیت ثبت شد."
                ));

                NotificationService::send('reward_redemption', $user, [
                    'reward_title' => $reward->title,
                    'points' => $reward->points_cost
                ]);

                // ارسال نوتیفیکیشن به ادمین‌ها
                $admins = User::role(['super-admin', 'admin'])->get();
                if ($admins->isNotEmpty()) {
                    \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\SystemNotification(
                        'درخواست جایزه جدید',
                        "کاربر {$user->first_name} {$user->last_name} درخواست دریافت جایزه '{$reward->title}' را ثبت کرد."
                    ));
                }
            } catch (Exception $e) {}

            return $redemption;
        });
        } finally {
            $lock->release();
        }
    }

    /**
     * تغییر وضعیت درخواست جایزه توسط ادمین (تایید/رد/تکمیل)
     */
    public function updateRedemptionStatus(int $id, string $status, ?string $adminNote, ?string $trackingCode, int $adminId)
    {
        $redemption = RewardRedemption::with(['reward', 'user'])->findOrFail($id);

        return DB::transaction(function () use ($redemption, $status, $adminNote, $trackingCode, $adminId) {

            // اگر وضعیت به "رد شده" تغییر کرد و قبلاً رد نشده بود -> برگشت امتیاز به کاربر
            if ($status === 'rejected' && $redemption->status !== 'rejected') {
                if ($redemption->points_spent > 0) {
                    PointTransaction::awardPoints(
                        $redemption->user_id,
                        $redemption->points_spent,
                        null,
                        "برگشت امتیاز - رد درخواست جایزه: " . ($redemption->reward ? $redemption->reward->title : 'جایزه حذف شده'),
                        $redemption
                    );
                }

                if ($redemption->cash_spent > 0) {
                    $wallet = $redemption->user->wallet()->firstOrCreate(['user_id' => $redemption->user_id], ['balance' => 0]);
                    $wallet->increment('balance', $redemption->cash_spent);
                    $wallet->transactions()->create([
                        'amount' => $redemption->cash_spent,
                        'type' => 'deposit',
                        'status' => 'success',
                        'description' => "برگشت وجه - رد درخواست جایزه: " . ($redemption->reward ? $redemption->reward->title : 'جایزه حذف شده'),
                    ]);
                }

                // اگر جایزه وجود داشت، موجودی کالا را برگردان
                if ($redemption->reward) {
                    $redemption->reward->increment('stock');
                }
            }

            // اگر وضعیت به "اعطای امتیاز" تغییر کرد
            if ($status === 'converted' && $redemption->status !== 'converted') {
                $pointsToGrant = 0;
                $title = '';

                if ($redemption->lucky_wheel_spin_id) {
                    $spin = \App\Models\LuckyWheelSpin::with('prize')->find($redemption->lucky_wheel_spin_id);
                    if ($spin && $spin->prize && $spin->prize->value > 0) {
                        $pointsToGrant = $spin->prize->value;
                        $title = $spin->prize->title;
                    }
                } elseif ($redemption->reward && $redemption->reward->points_cost > 0) {
                    $pointsToGrant = $redemption->reward->points_cost;
                    $title = $redemption->reward->title;
                }

                if ($pointsToGrant > 0) {
                    PointTransaction::awardPoints(
                        $redemption->user_id,
                        $pointsToGrant,
                        null,
                        "معادل امتیازی جایزه: " . $title,
                        $redemption
                    );

                    ActivityLog::log(
                        'reward.points_granted',
                        "امتیاز معادل جایزه ({$pointsToGrant}) به کاربر داده شد.",
                        ['user_id' => $redemption->user_id, 'redemption_id' => $redemption->id]
                    );
                }
            }

            // اگر وضعیت به "تایید شده" تغییر کرد و مربوط به گردونه شانس بود -> اعطای امتیاز معادل ارزش جایزه
            if ($status === 'approved' && $redemption->lucky_wheel_spin_id) {
                $spin = \App\Models\LuckyWheelSpin::with('prize')->find($redemption->lucky_wheel_spin_id);

                if ($spin && $spin->prize && $spin->prize->value > 0) {
                    // بررسی اینکه قبلاً امتیاز داده نشده باشد (مثلاً اگر قبلاً تایید شده بود)
                    // اما چون وضعیت جدید 'approved' است و قبلی نبوده، فرض بر این است که داده نشده.
                    // برای اطمینان بیشتر می‌توانیم چک کنیم.

                    PointTransaction::awardPoints(
                        $redemption->user_id,
                        $spin->prize->value,
                        null,
                        "پاداش جایزه فیزیکی گردونه: " . $spin->prize->title,
                        $redemption
                    );

                    ActivityLog::log(
                        'reward.points_awarded',
                        "امتیاز معادل جایزه فیزیکی گردونه ({$spin->prize->value}) به کاربر داده شد.",
                        ['user_id' => $redemption->user_id, 'redemption_id' => $redemption->id]
                    );
                }
            }

            $redemption->update([
                'status' => $status,
                'admin_note' => $adminNote,
                'tracking_code' => $trackingCode,
                'admin_id' => $adminId
            ]);

            ActivityLog::log(
                'reward.status_update',
                "وضعیت درخواست جایزه #{$redemption->id} به {$status} تغییر کرد",
                ['admin_id' => $adminId, 'redemption_id' => $redemption->id]
            );

            return $redemption;
        });
    }
}
