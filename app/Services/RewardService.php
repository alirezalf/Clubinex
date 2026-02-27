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
        return DB::transaction(function () use ($user, $rewardId, $deliveryInfo) {
            // قفل کردن رکورد جایزه برای مدیریت صحیح موجودی در درخواست‌های همزمان
            $reward = Reward::where('id', $rewardId)->lockForUpdate()->firstOrFail();

            if (!$reward->canUserRedeem($user)) {
                throw new Exception('شما شرایط دریافت این جایزه را ندارید یا موجودی تمام شده است.');
            }

            // کسر امتیاز از کاربر
            // نکته: متد deductPoints خودش قفل روی رکورد کاربر را مدیریت می‌کند
            $transaction = PointTransaction::deductPoints(
                $user->id,
                $reward->points_cost,
                null,
                "دریافت جایزه: {$reward->title}",
                $reward
            );

            if (!$transaction) {
                 throw new Exception('خطا در کسر امتیاز. موجودی کافی نیست.');
            }

            // ثبت درخواست
            $redemption = RewardRedemption::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_cost,
                'status' => 'pending',
                'delivery_info' => $deliveryInfo,
                'tracking_code' => 'RWD-' . strtoupper(Str::random(8)),
            ]);

            // کاهش موجودی انبار
            $reward->decrement('stock');

            // ارسال نوتیفیکیشن به کاربر
            try {
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

                // اگر جایزه وجود داشت، موجودی کالا را برگردان
                if ($redemption->reward) {
                    $redemption->reward->increment('stock');
                }
            }

            // اگر وضعیت به "تبدیل به امتیاز" تغییر کرد و مربوط به گردونه شانس بود -> اعطای امتیاز معادل ارزش جایزه
            if ($status === 'converted' && $redemption->status !== 'converted' && $redemption->lucky_wheel_spin_id) {
                $spin = \App\Models\LuckyWheelSpin::with('prize')->find($redemption->lucky_wheel_spin_id);

                if ($spin && $spin->prize && $spin->prize->value > 0) {
                    // بررسی اینکه قبلاً امتیاز داده نشده باشد
                    $alreadyAwarded = PointTransaction::where('reference_type', RewardRedemption::class)
                        ->where('reference_id', $redemption->id)
                        ->where('type', 'earn')
                        ->exists();

                    if (!$alreadyAwarded) {
                        PointTransaction::awardPoints(
                            $redemption->user_id,
                            $spin->prize->value,
                            null,
                            "تبدیل جایزه فیزیکی گردونه به امتیاز: " . $spin->prize->title,
                            $redemption
                        );

                        ActivityLog::log(
                            'reward.points_awarded',
                            "امتیاز معادل جایزه فیزیکی گردونه ({$spin->prize->value}) به کاربر داده شد.",
                            ['user_id' => $redemption->user_id, 'redemption_id' => $redemption->id]
                        );
                    }
                } else {
                    throw new Exception('این جایزه فیزیکی ارزش امتیازی برای تبدیل ندارد.');
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
