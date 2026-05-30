<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\DynamicReportController;

class TestReportCommand extends Command
{
    protected $signature = 'test:report';
    protected $description = 'Test report fetch';

    public function handle()
    {
        $controller = app()->make(DynamicReportController::class);
        $request = Request::create('/admin/reports/dynamic/fetch', 'POST', [
            'table' => 'users',
            'fields' => ['id', 'first_name', 'last_name'],
            'page' => 1,
            'per_page' => 20,
            'sort_dir' => 'desc',
            'advanced_filters' => []
        ]);

        $response = $controller->fetchData($request);
        $this->info($response->getContent());
    }
}
