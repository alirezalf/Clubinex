<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_name', 'title_fa', 'variables',
        'sms_active', 'sms_pattern',
        'email_active', 'email_subject', 'email_body', 'email_theme_id',
        'database_active', 'database_message'
    ];

    protected $casts = [
        'sms_active' => 'boolean',
        'email_active' => 'boolean',
        'database_active' => 'boolean',
    ];

    public function emailTheme()
    {
        return $this->belongsTo(EmailTheme::class);
    }
}