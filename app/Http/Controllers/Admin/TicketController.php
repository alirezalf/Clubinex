<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Services\NotificationService;
use App\Http\Requests\Ticket\ReplyTicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'open');
        $query = Ticket::with('user')->latest();

        // فیلتر open شامل تیکت‌های جدید و پاسخ مشتری است (که بج دارند)
        if ($status === 'open') {
            $query->whereIn('status', ['open', 'customer_reply']);
        } elseif ($status === 'active') {
            // تیکت‌های فعال شامل pending هم می‌شود
            $query->where('status', '!=', 'closed');
        } elseif ($status === 'answered') {
            $query->where('status', 'answered');
        } elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        $tickets = $query->paginate(20)->withQueryString();

        $tickets->getCollection()->transform(function ($ticket) {
            $ticket->created_at_jalali = $ticket->created_at_jalali;
            $ticket->status_farsi = $ticket->status_farsi;
            return $ticket;
        });

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => ['status' => $status]
        ]);
    }

    public function show($id)
    {
        $ticket = Ticket::with(['user', 'messages' => function($q) {
            $q->orderBy('created_at', 'asc');
        }, 'messages.user', 'assignedTo'])->findOrFail($id);
        
        // --- اصلاحیه مهم برای رفع باگ بج ---
        // اگر ادمین تیکت را باز کرد و وضعیت "باز" یا "پاسخ مشتری" بود،
        // وضعیت را به "در حال بررسی" تغییر می‌دهیم تا بج قرمز حذف شود.
        if (in_array($ticket->status, ['open', 'customer_reply'])) {
            $ticket->update(['status' => 'pending']);
        }
        // -----------------------------------

        $messages = $ticket->messages->map(function($msg) {
            $msg->created_at_jalali = $msg->created_at_jalali;
            return $msg;
        });

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => array_merge($ticket->toArray(), [
                'status_farsi' => $ticket->status_farsi,
                'created_at_jalali' => $ticket->created_at_jalali
            ]),
            'messages' => $messages
        ]);
    }

    public function reply(ReplyTicketRequest $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        if ($ticket->status === 'closed') {
            return back()->with('error', 'این تیکت بسته شده است.');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message
        ]);

        // وقتی ادمین پاسخ داد، وضعیت به "پاسخ داده شده" تغییر می‌کند
        $ticket->update(['status' => 'answered']);

        NotificationService::send('ticket_reply', $ticket->user, [
            'ticket_id' => $ticket->id,
            'subject' => $ticket->subject
        ]);

        return back()->with('message', 'پاسخ شما با موفقیت ارسال شد و به اطلاع کاربر رسید.');
    }

    public function close($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['status' => 'closed']);
        
        return back()->with('message', 'تیکت با موفقیت بسته شد.');
    }
}