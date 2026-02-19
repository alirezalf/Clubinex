<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Club;
use App\Models\NotificationBroadcast;
use App\Jobs\SendBroadcastNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'send');

        $data = [
            'tab' => $tab,
            'clubs' => Club::select('id', 'name')->get(),
        ];

        if ($tab === 'history') {
            $data['history'] = NotificationBroadcast::with(['admin', 'targetClub'])
                ->latest()
                ->paginate(10)
                ->through(function ($item) {
                    $item->created_at_jalali = $item->created_at_jalali;
                    $item->target_label = $item->target_label;
                    $item->admin_name = $item->admin ? $item->admin->full_name : 'سیستم';
                    
                    if ($item->target_type === 'manual') {
                        $item->recipients_list = $item->getRecipients();
                    }
                    
                    return $item;
                });
        }

        // نکته مهم: قبلاً در اینجا لیست کل کاربران بارگذاری می‌شد که باعث کندی شدید در تعداد بالا بود.
        // اکنون جستجوی کاربر از طریق API (/api/users/search) در فرانت‌اند انجام می‌شود.
        if ($tab === 'send') {
            $data['allUsers'] = []; // دیگر نیازی به ارسال لیست کامل نیست
        }

        return Inertia::render('Admin/Notifications/Send', $data);
    }

    public function send(Request $request)
    {
        $request->validate([
            'target_type' => 'required|in:all,club,manual',
            'club_id' => 'required_if:target_type,club',
            'selected_user_ids' => 'required_if:target_type,manual|array',
            'channels' => 'required|array|min:1',
            'channels.*' => 'in:database,sms,email',
            'title' => 'required|string|max:100',
            'message' => 'required|string|max:1000',
        ]);

        // Calculate count for record
        $count = 0;
        if ($request->target_type === 'all') {
            $count = User::active()->count();
        } elseif ($request->target_type === 'club') {
            $count = User::active()->where('club_id', $request->club_id)->count();
        } elseif ($request->target_type === 'manual') {
            $count = count($request->selected_user_ids);
        }

        if ($count === 0) {
            return back()->with('error', 'هیچ کاربری یافت نشد.');
        }

        try {
            DB::beginTransaction();

            $broadcast = NotificationBroadcast::create([
                'admin_id' => auth()->id(),
                'title' => $request->title,
                'message' => $request->message,
                'target_type' => $request->target_type,
                'target_id' => $request->target_type === 'club' ? $request->club_id : null,
                'recipient_ids' => $request->target_type === 'manual' ? $request->selected_user_ids : null,
                'channels' => $request->channels,
                'recipient_count' => $count
            ]);

            // Dispatch Job
            SendBroadcastNotification::dispatch($broadcast);

            DB::commit();
            return back()->with('message', "عملیات ارسال برای {$count} کاربر در صف قرار گرفت.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در ثبت درخواست: ' . $e->getMessage());
        }
    }
}
