<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticket;
use App\Models\SystemSetting;
use App\Models\ActivityLog;

class AutoCloseTickets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:auto-close';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically close tickets that have been inactive for a certain period after admin reply.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = SystemSetting::getValue('support', 'ticket_auto_close_hours');

        if (!$hours || !is_numeric($hours) || $hours <= 0) {
            $this->info('Auto-close feature is disabled or not configured.');
            return;
        }

        $cutoffTime = now()->subHours($hours);

        $tickets = Ticket::where('status', 'answered')
            ->where('updated_at', '<', $cutoffTime)
            ->get();

        if ($tickets->isEmpty()) {
            $this->info('No tickets to close.');
            return;
        }

        foreach ($tickets as $ticket) {
            $ticket->update(['status' => 'closed']);
            
            ActivityLog::log(
                'ticket.auto_closed',
                "تیکت #{$ticket->id} به دلیل عدم پاسخ کاربر پس از {$hours} ساعت به صورت خودکار بسته شد",
                [
                    'model_type' => Ticket::class,
                    'model_id' => $ticket->id,
                    'user_id' => $ticket->user_id
                ]
            );
        }

        $this->info("Closed {$tickets->count()} tickets.");
    }
}