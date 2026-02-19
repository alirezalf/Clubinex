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
}