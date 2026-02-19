<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class RegisterProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tool_name' => 'required|string|max:255',
            'tool_model' => 'required|string|max:255',
            'tool_brand_name' => 'nullable|string|max:100',
            'tool_serial' => 'nullable|string|max:100', // اختیاری چون ممکن است اتوماتیک تولید شود
            'category_id' => 'required|exists:categories,id',
            
            // اعتبارسنجی فایل‌ها
            'tool_pic_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
            'invoice_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB (اجباری)
            
            // اعتبارسنجی نقش‌ها
            'customer_user' => 'required|in:owner,other',
            'customer_mobile_number' => 'required_if:customer_user,other|nullable|string|min:10|max:15',
            
            'seller_user' => 'required|in:none,owner,other',
            'seller_mobile_number' => 'required_if:seller_user,other|nullable|string|min:10|max:15',
            
            'introducer_user' => 'required|in:none,owner,other',
            'introducer_mobile_number' => 'required_if:introducer_user,other|nullable|string|min:10|max:15',
            
            'guarantee_status' => 'required|in:no_guarantee,reg_guarantee,pre_guarantee',
        ];
    }

    public function attributes()
    {
        return [
            'tool_name' => 'نام ابزار',
            'tool_model' => 'مدل ابزار',
            'invoice_file' => 'تصویر فاکتور',
            'customer_mobile_number' => 'شماره موبایل مشتری',
        ];
    }
}