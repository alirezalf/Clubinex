<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'wp_id',
        'category_id', 'title', 'model_name', 
        'brand',
        'description', 'image', 'points_value', 'is_active'
    ];

    protected $appends = ['display_image'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function serials()
    {
        return $this->hasMany(ProductSerial::class);
    }

    /**
     * دریافت آدرس قابل نمایش تصویر
     * تشخیص خودکار لینک‌های خارجی (وردپرس) و فایل‌های لوکال
     */
    public function getDisplayImageAttribute()
    {
        $image = $this->image;

        if (!$image) {
            return null;
        }

        // اگر لینک کامل است (مثل لینک‌های وردپرس)
        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }

        // اگر فایل لوکال است ولی آدرس کامل ندارد (فقط نام فایل است)
        if (!str_starts_with($image, '/storage') && !str_starts_with($image, 'http')) {
            return Storage::url($image);
        }

        return $image;
    }
}