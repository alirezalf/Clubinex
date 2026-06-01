<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'color',
        'bg',
        'sort_order',
    ];

    public function articles()
    {
        return $this->hasMany(HelpArticle::class)->orderBy('sort_order');
    }
}
