<?php

namespace App\Jobs;

use App\Services\WordPress\WpProductService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncWpProducts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $mapping;
    protected $page;
    public $timeout = 300;

    public function __construct(array $mapping, int $page = 1)
    {
        $this->mapping = $mapping;
        $this->page = $page;
    }

    public function handle(WpProductService $wpService): void
    {
        try {
            $result = $wpService->syncProductsMapped($this->mapping, $this->page, 20);
            
            if ($result['success'] && !$result['finished']) {
                // Dispatch next page
                self::dispatch($this->mapping, $result['next_page']);
            }
            
            Log::info("WP Sync Page {$this->page} Completed.", $result);
        } catch (\Exception $e) {
            Log::error("WP Sync Failed Page {$this->page}: " . $e->getMessage());
        }
    }
}