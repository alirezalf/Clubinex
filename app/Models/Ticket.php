<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'assigned_to', 'subject', 'department', 'priority', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }

    public function getStatusFarsiAttribute()
    {
        $statuses = [
            'open' => 'باز (جدید)',
            'pending' => 'در حال بررسی', // وضعیت جدید
            'answered' => 'پاسخ داده شده',
            'customer_reply' => 'پاسخ مشتری',
            'closed' => 'بسته شده'
        ];
        return $statuses[$this->status] ?? $this->status;
    }
}