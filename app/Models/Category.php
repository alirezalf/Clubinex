<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['wp_id', 'parent_id', 'title', 'slug', 'icon', 'is_active'];

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($category) {
            if ($category->isForceDeleting()) {
                $category->products()->forceDelete();
                $category->children()->forceDelete();
            } else {
                $category->products()->delete();
                $category->children()->delete();
            }
        });

        static::restored(function ($category) {
            $category->products()->restore();
            $category->children()->restore();
        });
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // متد بازگشتی برای دریافت نام کامل سلسله مراتبی
    public function getFullNameAttribute()
    {
        if ($this->parent) {
            return $this->parent->full_name . ' > ' . $this->title;
        }
        return $this->title;
    }
}
