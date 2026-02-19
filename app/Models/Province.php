<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Province extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'is_active'];

    public function cities()
    {
        return $this->hasMany(City::class);
    }
    
    public function users()
    {
        return $this->hasMany(User::class);
    }
}