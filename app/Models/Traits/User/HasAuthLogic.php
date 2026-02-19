<?php

namespace App\Models\Traits\User;

use App\Models\UserStatus;

trait HasAuthLogic
{
    public function isOtpVerified()
    {
        return !is_null($this->otp_verified_at);
    }

    public function isAgent()
    {
        return !is_null($this->agent_id) || $this->hasRole('agent');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isActive()
    {
        return optional($this->status)->slug === 'active';
    }

    public function canLoginWithPassword()
    {
        return !empty($this->password) && !is_null($this->password_set_at);
    }

    public function shouldUseOtpLogin()
    {
        if (!$this->canLoginWithPassword()) {
            return true;
        }
        if ($this->created_at->diffInDays(now()) < 7) {
            return true;
        }
        return false;
    }

    public function getLoginMethod()
    {
        if ($this->shouldUseOtpLogin()) {
            return 'otp';
        }
        return 'password';
    }

    public function setPassword($password)
    {
        $this->password = bcrypt($password);
        $this->password_set_at = now();
        $this->save();
    }

    public function verifyOtp($otp)
    {
        if ($this->otp === $otp) {
            $this->update([
                'otp_verified_at' => now(),
                'otp' => null,
                'status_id' => UserStatus::where('slug', 'active')->first()->id,
            ]);
            return true;
        }
        return false;
    }

    public function sendNewOtp()
    {
        $otp = rand(10000, 99999);
        $this->update([
            'otp' => $otp,
            'otp_verified_at' => null,
        ]);
        return $otp;
    }

    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
    }
    
    public function hasVerifiedEmail() { return !is_null($this->email_verified_at); }
}