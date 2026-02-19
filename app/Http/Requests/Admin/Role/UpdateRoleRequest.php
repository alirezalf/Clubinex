<?php

namespace App\Http\Requests\Admin\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('roles')->ignore($roleId)],
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ];
    }
}