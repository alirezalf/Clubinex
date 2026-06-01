<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'help_category_id',
        'title',
        'slug',
        'content',
        'sort_order',
    ];

    public function category()
    {
        return $this->belongsTo(HelpCategory::class, 'help_category_id');
    }
}
