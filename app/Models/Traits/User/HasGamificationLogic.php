<?php

namespace App\Models\Traits\User;

trait HasGamificationLogic
{
    public function generateReferralCode()
    {
        if (!$this->referral_code) {
            $code = strtoupper(substr(md5($this->mobile . time()), 0, 8));
            $this->update(['referral_code' => $code]);
        }
        return $this->referral_code;
    }

    public function getDirectReferrals()
    {
        return $this->referrals()->where('level', 1)->with('referred')->get();
    }

    public function getDirectReferralsCountAttribute()
    {
        return $this->referrals()->where('level', 1)->count();
    }

    public function canReferNewUser()
    {
        return $this->isActive() && $this->profile_completed;
    }
}