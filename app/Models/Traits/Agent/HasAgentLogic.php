<?php

namespace App\Models\Traits\Agent;

use App\Models\ActivityLog;
use App\Models\ReferralCommission;

trait HasAgentLogic
{
    /**
     * بررسی آیا نماینده تأیید شده است
     */
    public function isVerified()
    {
        return !is_null($this->verified_at);
    }

    /**
     * دریافت تعداد مشتریان نماینده
     */
    public function getClientCountAttribute()
    {
        return $this->clients()->count();
    }

    /**
     * بررسی آیا نماینده ظرفیت خالی دارد
     */
    public function hasAvailableSlots()
    {
        if (is_null($this->max_clients)) {
            return true; // بدون محدودیت
        }
        return $this->client_count < $this->max_clients;
    }

    /**
     * دریافت متن وضعیت نماینده
     */
    public function getStatusTextAttribute()
    {
        if (!$this->is_active) return 'غیرفعال';
        if (!$this->isVerified()) return 'در انتظار تأیید';
        return 'فعال';
    }

    /**
     * دریافت کلاس رنگ وضعیت نماینده
     */
    public function getStatusColorAttribute()
    {
        if (!$this->is_active) return 'danger';
        if (!$this->isVerified()) return 'warning';
        return 'success';
    }

    /**
     * دریافت درصد پر شدن ظرفیت
     */
    public function getCapacityPercentageAttribute()
    {
        if (is_null($this->max_clients) || $this->max_clients == 0) {
            return null;
        }

        return min(100, round(($this->client_count / $this->max_clients) * 100, 2));
    }

    /**
     * دریافت کل کمیسیون‌های دریافتی ایجنت
     * محاسبه بر اساس جدول کمیسیون‌های معرف
     */
    public function getTotalCommissionAttribute()
    {
        return ReferralCommission::whereHas('referralNetwork', function($q) {
             $q->where('referrer_id', $this->user_id);
        })->sum('earned_points');
    }

    /**
     * تأیید نماینده
     */
    public function verify($adminId)
    {
        $result = $this->update([
            'verified_at' => now(),
            'is_active' => true,
        ]);

        if ($result) {
            ActivityLog::log(
                'agent.verified',
                "نماینده با کد {$this->agent_code} تأیید شد",
                [
                    'user_id' => $this->user_id,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                ]
            );
        }

        return $result;
    }

    /**
     * غیرفعال کردن نماینده
     */
    public function deactivate($adminId, $reason = '')
    {
        $result = $this->update(['is_active' => false]);

        if ($result) {
            ActivityLog::log(
                'agent.deactivated',
                "نماینده با کد {$this->agent_code} غیرفعال شد. دلیل: {$reason}",
                [
                    'user_id' => $this->user_id,
                    'admin_id' => $adminId,
                    'model_type' => self::class,
                    'model_id' => $this->id,
                    'old_values' => ['is_active' => true],
                    'new_values' => ['is_active' => false],
                ]
            );
        }

        return $result;
    }

    /**
     * تولید کد نمایندگی یکتا
     */
    public static function generateAgentCode()
    {
        do {
            $code = 'AG' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (self::where('agent_code', $code)->exists());

        return $code;
    }
}
