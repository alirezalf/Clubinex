<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage users');
    }

    public function rules(): array
    {
        $userId = $this->route('id'); // دریافت ID از روت

        return [
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'mobile' => ['required', 'string', 'regex:/^09[0-9]{9}$/', Rule::unique('users')->ignore($userId)],
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($userId)],
            'club_id' => 'nullable|exists:clubs,id',
            'current_points' => 'nullable|integer',
            'role' => 'nullable|exists:roles,name'
        ];
    }
}