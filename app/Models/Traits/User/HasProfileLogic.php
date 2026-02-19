<?php

namespace App\Models\Traits\User;

use Illuminate\Support\Str;
use Morilog\Jalali\Jalalian;

trait HasProfileLogic
{
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getProfileCompletionPercentageAttribute()
    {
        $requiredFields = [
            'first_name', 'last_name', 'national_code', 'birth_date', 
            'job', 'province_id', 'city_id', 'postal_code', 'address', 
            'email', 'avatar',
        ];

        $completed = 0;
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $completed++;
            }
        }

        return round(($completed / count($requiredFields)) * 100);
    }

    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d');
    }

    public function getBirthDateJalaliAttribute()
    {
        return $this->birth_date ? Jalalian::fromDateTime($this->birth_date)->format('Y/m/d') : null;
    }

    public function getFullAddressAttribute()
    {
        $parts = [];
        if ($this->province) $parts[] = $this->province->name;
        if ($this->city) $parts[] = $this->city->name;
        if ($this->address) $parts[] = $this->address;

        return implode(' - ', $parts);
    }

    public function getAgeAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }
        return $this->birth_date->age;
    }

    public function isBirthdayToday()
    {
        if (!$this->birth_date) {
            return false;
        }
        return $this->birth_date->month == now()->month &&
               $this->birth_date->day == now()->day;
    }

    public function completeProfile()
    {
        if (!$this->profile_completed) {
            $this->update(['profile_completed' => true]);
        }
    }

    public function initials(): string
    {
        return Str::of($this->first_name . ' ' . $this->last_name)
            ->explode(' ')
            ->take(2)
            ->map(fn ($word) => Str::substr($word, 0, 1))
            ->implode('');
    }
    
    public function getProvinceNameAttribute()
    {
        return $this->province ? $this->province->name : null;
    }

    public function getCityNameAttribute()
    {
        return $this->city ? $this->city->name : null;
    }
}