<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // دریافت تمام نوتیفیکیشن‌ها با صفحه‌بندی
        $notifications = $user->notifications()->paginate(15);

        // افزودن تاریخ شمسی برای نمایش
        $notifications->getCollection()->transform(function ($n) {
            $data = $n->data;
            if (!isset($data['created_at_jalali'])) {
                $data['created_at_jalali'] = \Morilog\Jalali\Jalalian::fromDateTime($n->created_at)->format('Y/m/d H:i');
                $n->data = $data;
            }
            return $n;
        });

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications
        ]);
    }
    
    public function unreadCount()
    {
        return response()->json(['count' => auth()->user()->unreadNotifications()->count()]);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back()->with('message', 'همه پیام‌ها به عنوان خوانده شده علامت‌گذاری شدند.');
    }

    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        if (!$notification->read_at) {
            $notification->markAsRead();
        }
        return back();
    }

    public function destroy($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->delete();
        return back()->with('message', 'پیام حذف شد.');
    }
}