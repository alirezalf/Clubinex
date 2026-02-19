<?php

namespace App\Models\Traits\User;

use App\Models\UserStatus;
use App\Models\Club;
use App\Models\User;
use App\Models\Agent;
use App\Models\Province;
use App\Models\City;
use App\Models\PointTransaction;
use App\Models\SurveyAnswer;
use App\Models\ClubRegistration;
use App\Models\ReferralNetwork;
use App\Models\UserSession;
use App\Models\SmsLog;
use App\Models\EmailLog;
use App\Models\ActivityLog;
use App\Models\ProductSerial;

trait HasSystemRelations
{
    public function status()
    {
        return $this->belongsTo(UserStatus::class, 'status_id');
    }

    public function club()
    {
        return $this->belongsTo(Club::class, 'club_id');
    }

    public function memberships()
    {
        return $this->belongsToMany(Club::class, 'club_user')->withPivot('joined_at', 'is_active');
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class, 'user_id');
    }

    public function surveyAnswers()
    {
        return $this->hasMany(SurveyAnswer::class, 'user_id');
    }

    public function clubRegistrations()
    {
        return $this->hasMany(ClubRegistration::class, 'user_id');
    }

    public function referrals()
    {
        return $this->hasMany(ReferralNetwork::class, 'referrer_id');
    }

    public function referredUsers()
    {
        return $this->hasMany(ReferralNetwork::class, 'referred_id');
    }

    public function userSessions()
    {
        return $this->hasMany(UserSession::class, 'user_id');
    }

    public function smsLogs()
    {
        return $this->hasMany(SmsLog::class, 'user_id');
    }

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class, 'user_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    public function registeredSerials()
    {
        return $this->hasMany(ProductSerial::class, 'used_by');
    }
}