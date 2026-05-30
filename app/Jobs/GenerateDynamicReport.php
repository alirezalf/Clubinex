<?php

namespace App\Jobs;

use App\Exports\DynamicReportExport;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\Report\QueryBuilderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class GenerateDynamicReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 minutes

    protected $userId;
    protected $requestData;
    protected $selectedFields;

    public function __construct(int $userId, array $requestData, array $selectedFields)
    {
        $this->userId = $userId;
        $this->requestData = $requestData;
        $this->selectedFields = $selectedFields;
    }

    public function handle(QueryBuilderService $queryBuilderService): void
    {
        try {
            $user = User::find($this->userId);
            if (!$user) return;

            // Reconstruct the request to pass to QueryBuilderService
            $request = new Request($this->requestData);

            $query = $queryBuilderService->buildQuery($request);

            if (!$query) {
                // Notifying that the report was empty
                NotificationService::send('report_empty', $user, [
                    'report_name' => $this->requestData['table'] ?? 'ناشناس'
                ]);
                return;
            }

            $sortField = $request->input('sort_by', 'created_at');
            $sortDir = $request->input('sort_dir', 'desc');

            if (Schema::hasColumn($this->requestData['table'], $sortField)) {
                $query->orderBy($sortField, $sortDir);
            } else {
                $query->orderBy('id', $sortDir);
            }

            $showRowNumber = isset($this->requestData['show_row_number']) ? filter_var($this->requestData['show_row_number'], FILTER_VALIDATE_BOOLEAN) : false;

            $fileName = 'custom_report_' . $this->userId . '_' . date('Y-m-d_H-i-s') . '.xlsx';
            $filePath = 'reports/' . $fileName;

            // Store the excel file in the default disk (usually local or public)
            Excel::store(new DynamicReportExport($query, $this->selectedFields, $showRowNumber), $filePath, 'public');

            // Send notification to the user with the download link
            $downloadLink = Storage::disk('public')->url($filePath);

            // You might need a specific notification template for this
            NotificationService::send('report_ready', $user, [
                'report_name' => $this->requestData['table'] ?? 'گزارش پویا',
                'download_link' => url($downloadLink)
            ]);

            Log::info("Dynamic report generated successfully for user {$this->userId}: {$filePath}");
        } catch (\Exception $e) {
            Log::error("Failed to generate dynamic report: " . $e->getMessage());
        }
    }
}
