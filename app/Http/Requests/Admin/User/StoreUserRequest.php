<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage users'); // یا true اگر از میدل‌ور استفاده می‌شود
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'mobile' => 'required|string|regex:/^09[0-9]{9}$/|unique:users,mobile',
            'password' => 'required|string|min:6',
            'club_id' => 'nullable|exists:clubs,id',
            'current_points' => 'nullable|integer|min:0',
            'role' => 'required|string|exists:roles,name',
        ];
    }
    
    public function attributes()
    {
        return [
            'first_name' => 'نام',
            'last_name' => 'نام خانوادگی',
            'mobile' => 'موبایل',
            'role' => 'نقش کاربری',
        ];
    }
}