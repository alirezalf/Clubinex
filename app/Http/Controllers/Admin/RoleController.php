<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\Admin\Role\StoreRoleRequest;
use App\Http\Requests\Admin\Role\UpdateRoleRequest;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $permissions = Permission::all();

        // Auto-generate permissions if empty (e.g. fresh installation without running seeder)
        if ($permissions->isEmpty()) {
            $modules = ['users', 'products', 'categories', 'rewards', 'clubs', 'sliders', 'reports', 'settings', 'tickets', 'notifications', 'gamification'];
            $actions = ['view', 'create', 'edit', 'delete'];

            foreach ($modules as $moduleKey) {
                foreach ($actions as $actionKey) {
                    Permission::firstOrCreate(['name' => "{$moduleKey}.{$actionKey}"]);
                }
            }

            $extraPermissions = ['dashboard.view', 'products.import', 'products.sync_wp', 'products.approve', 'rewards.approve'];
            foreach ($extraPermissions as $perm) {
                Permission::firstOrCreate(['name' => $perm]);
            }

            $permissions = Permission::all();
        }

        $roles = Role::with('permissions')->get();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        $validated = $request->validated();

        $role = Role::create(['name' => $validated['name']]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('message', 'نقش جدید ایجاد شد.');
    }

    public function update(UpdateRoleRequest $request, $id)
    {
        $role = Role::findOrFail($id);
        $validated = $request->validated();

        $role->update(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('message', 'نقش بروزرسانی شد.');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return back()->with('message', 'نقش حذف شد.');
    }
}
