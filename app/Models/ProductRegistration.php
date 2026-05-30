<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Morilog\Jalali\Jalalian;

class ProductRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_name', 'product_model', 'product_brand', 'serial_code', 'category_id',
        'product_image', 'invoice_image',
        'customer_type', 'customer_mobile',
        'seller_type', 'seller_mobile',
        'introducer_type', 'introducer_mobile',
        'warranty_status',
        'status', 'admin_note', 'admin_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }

    public function getStatusFarsiAttribute()
    {
        return match($this->status) {
            'pending' => 'در انتظار بررسی',
            'approved' => 'تایید شده',
            'rejected' => 'رد شده',
            default => $this->status
        };
    }

    public function getEstimatedPointsAttribute()
    {
        // 1. Try exact match
        $product = Product::where('title', trim($this->product_name))->first();

        // 2. Try loose match (if exact fails)
        if (!$product) {
            $product = Product::where('title', 'like', '%' . trim($this->product_name) . '%')->first();
        }

        if ($product && $product->points_value > 0) {
            return $product->points_value;
        }

        // Return default rule points
        $defaultRule = PointRule::where('action_code', 'product_registration_default')->first();
        return $defaultRule ? $defaultRule->points : 0;
    }

    public function getIsSerialValidAttribute()
    {
        if (empty($this->serial_code) || str_starts_with($this->serial_code, 'PROD-') || str_starts_with($this->serial_code, strtoupper(substr(\Illuminate\Support\Str::slug($this->product_model), 0, 6)))) {
            // It's likely an auto-generated serial, so we don't have a record of it yet
            return null;
        }

        $serialCode = strtr($this->serial_code, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9', '١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9','٠'=>'0']);
        $serialCode = strtoupper($serialCode);

        $exists = ProductSerial::where('serial_code', $serialCode)->exists();

        return $exists;
    }
}
