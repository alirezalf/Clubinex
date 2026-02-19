<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Club;
use App\Models\UserStatus;
use App\Models\PointTransaction;
use App\Models\ActivityLog;
use App\Http\Requests\Admin\User\StoreUserRequest;
use App\Http\Requests\Admin\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function usersList(Request $request)
    {
        $query = User::query()->with(['club', 'status', 'roles', 'permissions']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('mobile', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->role && $request->role !== 'all') {
            $query->role($request->role);
        }

        if ($request->club && $request->club !== 'all') {
            $query->where('club_id', $request->club);
        }

        $sortField = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        if (in_array($sortField, ['first_name', 'last_name', 'mobile', 'current_points', 'last_login_at', 'created_at'])) {
            $query->orderBy($sortField, $sortDir);
        } else {
            $query->latest();
        }

        $users = $query->paginate(15)->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $user->last_login_at_jalali = $user->last_login_at ? \Morilog\Jalali\Jalalian::fromDateTime($user->last_login_at)->format('Y/m/d H:i') : '-';
            // اضافه کردن پرمیشن‌های مستقیم کاربر برای نمایش
            $user->direct_permissions = $user->getDirectPermissions()->pluck('name');
            return $user;
        });

        $clubs = Club::select('id', 'name')->get();
        $roles = Role::select('name', 'id')->get();
        $statuses = UserStatus::select('id', 'name', 'slug')->get();
        
        // دریافت تمام پرمیشن‌ها و گروه‌بندی آنها برای نمایش در مودال
        $allPermissions = Permission::all()->map(function($perm) {
            $parts = explode('.', $perm->name);
            $perm->group = $parts[0] ?? 'other';
            return $perm;
        })->groupBy('group');

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'clubs' => $clubs,
            'roles' => $roles,
            'statuses' => $statuses,
            'allPermissions' => $allPermissions, // ارسال به فرانت
            'filters' => $request->only(['search', 'sort_by', 'sort_dir', 'role', 'club'])
        ]);
    }

    public function storeUser(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $statusId = UserStatus::where('slug', 'active')->first()->id;

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'mobile' => $validated['mobile'],
            'password' => Hash::make($validated['password']),
            'status_id' => $statusId,
            'club_id' => $validated['club_id'],
            'current_points' => $validated['current_points'] ?? 0,
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);
        
        // ذخیره پرمیشن‌های مستقیم اگر ارسال شده باشد
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        ActivityLog::log('user.created', "کاربر جدید {$user->full_name} ایجاد شد", [
            'admin_id' => auth()->id(),
            'model_id' => $user->id,
            'model_type' => User::class
        ]);

        return back()->with('message', 'کاربر جدید با موفقیت ایجاد شد.');
    }

    public function updateUser(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();

        if (isset($validated['current_points']) && $validated['current_points'] != $user->current_points) {
            $diff = $validated['current_points'] - $user->current_points;
            PointTransaction::create([
                'user_id' => $user->id,
                'type' => 'adjust',
                'amount' => $diff,
                'description' => 'تغییر دستی امتیاز توسط مدیر',
                'balance_after' => $validated['current_points'],
                'created_at' => now(),
            ]);
        }

        $user->update($validated);

        if($request->role) {
            $user->syncRoles([$request->role]);
        }
        
        // همگام‌سازی پرمیشن‌های مستقیم
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        ActivityLog::log('user.updated', "اطلاعات کاربر {$user->full_name} ویرایش شد", [
            'admin_id' => auth()->id(),
            'model_id' => $user->id,
            'model_type' => User::class
        ]);

        return back()->with('message', 'اطلاعات کاربر بروزرسانی شد.');
    }

    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);
        $activeId = UserStatus::where('slug', 'active')->first()->id;
        $bannedId = UserStatus::where('slug', 'banned')->first()->id;

        $newStatus = $user->status_id == $bannedId ? $activeId : $bannedId;
        $user->update(['status_id' => $newStatus]);

        ActivityLog::log('user.status_toggle', "وضعیت کاربر {$user->full_name} تغییر کرد", [
            'admin_id' => auth()->id(),
            'model_id' => $user->id,
            'new_values' => ['status_id' => $newStatus]
        ]);

        return back()->with('message', 'وضعیت کاربر تغییر کرد.');
    }

    public function resetUserPassword(Request $request, $id)
    {
        $request->validate(['password' => 'required|string|min:6']);
        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->password)]);

        ActivityLog::log('user.password_reset', "رمز عبور کاربر {$user->full_name} توسط مدیر ریست شد", [
            'admin_id' => auth()->id(),
            'model_id' => $user->id
        ]);

        return back()->with('message', 'رمز عبور کاربر با موفقیت تغییر کرد.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:users,id',
            'action' => 'required|in:change_status,change_club,send_message',
            'status_id' => 'required_if:action,change_status|exists:user_statuses,id',
            'club_id' => 'required_if:action,change_club|exists:clubs,id',
            'message' => 'required_if:action,send_message|string|max:500',
        ]);

        $ids = $request->ids;
        $action = $request->action;
        $count = count($ids);

        try {
            if ($action === 'change_status') {
                User::whereIn('id', $ids)->update(['status_id' => $request->status_id]);
                ActivityLog::log('user.bulk_status', "تغییر وضعیت گروهی برای {$count} کاربر", [
                    'admin_id' => auth()->id(),
                    'new_values' => ['status_id' => $request->status_id]
                ]);
            } 
            elseif ($action === 'change_club') {
                User::whereIn('id', $ids)->update(['club_id' => $request->club_id]);
                ActivityLog::log('user.bulk_club', "تغییر باشگاه گروهی برای {$count} کاربر", [
                    'admin_id' => auth()->id(),
                    'new_values' => ['club_id' => $request->club_id]
                ]);
            } 
            elseif ($action === 'send_message') {
                $users = User::whereIn('id', $ids)->get();
                foreach ($users as $user) {
                    \Illuminate\Support\Facades\Notification::send(
                        $user, 
                        new \App\Notifications\SystemNotification('پیام از طرف مدیریت', $request->message)
                    );
                }
                ActivityLog::log('user.bulk_message', "ارسال پیام گروهی برای {$count} کاربر", [
                    'admin_id' => auth()->id()
                ]);
            }

            return back()->with('message', "عملیات گروهی با موفقیت برای {$count} کاربر انجام شد.");

        } catch (\Exception $e) {
            return back()->with('error', 'خطا در انجام عملیات: ' . $e->getMessage());
        }
    }
}
