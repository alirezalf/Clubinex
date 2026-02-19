<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'min_points', 
        'max_points', 
        'discount_percent', 
        'icon', 
        'description'
    ];

    /**
     * کاربران متعلق به این سطح
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}