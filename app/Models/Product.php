<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory, SoftDeletes;

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

        // اگر لینک کامل است (مثل لینک‌های وردپرس یا هر لینک http/https)
        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        // اگر از قبل دارای /storage است
        if (str_starts_with($image, '/storage/')) {
            return $image;
        }

        // اگر با /uploads شروع می‌شود (فایل‌های آپلود مستقیم)
        if (str_starts_with($image, '/uploads/')) {
            return $image;
        }

        // مسیردهی فایل لوکال
        return Storage::url($image);
    }
}
