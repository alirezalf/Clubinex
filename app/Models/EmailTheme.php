<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmailTheme extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'content', 'styles', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * قالب‌هایی که از این تم استفاده می‌کنند
     */
    public function templates()
    {
        return $this->hasMany(NotificationTemplate::class);
    }
}