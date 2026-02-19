<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\SystemSetting;
use App\Models\User;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\ReplyTicketRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'active');
        $query = Ticket::where('user_id', Auth::id())->with(['assignedTo'])->latest();

        if ($status === 'active') {
            $query->where('status', '!=', 'closed');
        } elseif ($status === 'answered') {
            $query->where('status', 'answered');
        } elseif ($status === 'closed') {
            $query->where('status', 'closed');
        }

        $tickets = $query->paginate(10)->withQueryString();

        $tickets->getCollection()->transform(function ($ticket) {
            $ticket->created_at_jalali = $ticket->created_at_jalali;
            $ticket->status_farsi = $ticket->status_farsi;
            return $ticket;
        });

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filters' => ['status' => $status]
        ]);
    }

    public function show($id)
    {
        $ticket = Ticket::where('user_id', Auth::id())
            ->with(['messages' => function($q) {
                $q->orderBy('created_at', 'asc');
            }, 'messages.user', 'assignedTo'])
            ->findOrFail($id);
        
        $messages = $ticket->messages->map(function($msg) {
            $msg->created_at_jalali = $msg->created_at_jalali;
            return $msg;
        });

        return Inertia::render('Tickets/Show', [
            'ticket' => array_merge($ticket->toArray(), [
                'status_farsi' => $ticket->status_farsi,
                'created_at_jalali' => $ticket->created_at_jalali
            ]),
            'messages' => $messages,
            'isAdmin' => false
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        // Validation handled by FormRequest

        $assignedTo = $this->getBestSupportAgent();

        try {
            DB::beginTransaction();

            $ticket = Ticket::create([
                'user_id' => Auth::id(),
                'subject' => $request->subject,
                'department' => $request->department,
                'priority' => $request->priority,
                'status' => 'open',
                'assigned_to' => $assignedTo
            ]);

            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'message' => $request->message
            ]);

            DB::commit();
            return redirect()->route('tickets.index')->with('message', 'تیکت شما با موفقیت ثبت شد و به کارشناس مربوطه ارجاع گردید.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در ثبت تیکت: ' . $e->getMessage());
        }
    }

    public function reply(ReplyTicketRequest $request, $id)
    {
        $ticket = Ticket::where('user_id', Auth::id())->findOrFail($id);
        
        if ($ticket->status == 'closed') {
            return back()->with('error', 'این تیکت بسته شده است و امکان ارسال پاسخ وجود ندارد.');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message
        ]);

        $ticket->update(['status' => 'customer_reply']);

        return back()->with('message', 'پاسخ شما با موفقیت ارسال شد.');
    }

    public function close($id)
    {
        $ticket = Ticket::where('user_id', Auth::id())->findOrFail($id);
        $ticket->update(['status' => 'closed']);
        return back()->with('message', 'تیکت با موفقیت بسته شد.');
    }

    private function getBestSupportAgent()
    {
        $agentIds = SystemSetting::getValue('support', 'support_agents', []);
        if (empty($agentIds)) return null;

        $bestAgent = User::whereIn('id', $agentIds)
            ->withCount(['assignedTickets' => function ($query) {
                $query->whereIn('status', ['open', 'customer_reply']);
            }])
            ->orderBy('assigned_tickets_count', 'asc')
            ->first();

        return $bestAgent ? $bestAgent->id : null;
    }
}