<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminReports\TransactionReportService;
use App\Services\AdminReports\RedemptionReportService;
use App\Services\AdminReports\UserReportService;
use App\Services\AdminReports\ProductReportService;
use App\Services\AdminReports\SurveyReportService;
use App\Models\Survey;
use App\Models\User;
use App\Exports\SurveyParticipantsExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Morilog\Jalali\Jalalian;

class ReportController extends Controller
{
    public function __construct(
        private readonly TransactionReportService $transactionService,
        private readonly RedemptionReportService $redemptionService,
        private readonly UserReportService $userService,
        private readonly ProductReportService $productService,
        private readonly SurveyReportService $surveyService
    ) {}

    public function index(Request $request)
    {
        $tab = $request->input('tab', 'transactions');
        $filters = $request->only(['search', 'date_from', 'date_to', 'status', 'type', 'sort_by', 'sort_dir']);

        $data = [];

        switch ($tab) {
            case 'transactions':
                $data = $this->transactionService->getTransactions($request);
                break;
            case 'redemptions':
                $data = $this->redemptionService->getRedemptions($request);
                break;
            case 'users':
                $data = $this->userService->getUsers($request);
                break;
            case 'products':
                $data = $this->productService->getProducts($request);
                break;
            case 'surveys':
                $data = $this->surveyService->getSurveys($request);
                break;
        }

        return Inertia::render('Admin/Reports/Index', [
            'data' => $data,
            'filters' => $filters,
            'currentTab' => $tab
        ]);
    }

    public function surveyStats($id)
    {
        $stats = $this->surveyService->getSurveyStats($id);

        return Inertia::render('Admin/Reports/SurveyStats', $stats);
    }

    public function exportSurveyParticipants(Request $request, $surveyId)
    {
        $survey = Survey::findOrFail($surveyId);
        $data = $this->surveyService->getSurveyParticipantsForExport($surveyId);

        return Excel::download(new SurveyParticipantsExport($data, $survey->title), "participants_{$surveyId}.xlsx");
    }

    public function userStats($id)
    {
        $stats = $this->surveyService->getUserStats($id);
        return response()->json($stats);
    }

    public function export(Request $request)
    {
        $tab = $request->input('tab', 'transactions');
        $request->merge(['per_page' => 10000]); // to get more records without pagination limit if custom logic uses it

        $data = [];
        $header = [];

        switch ($tab) {
            case 'transactions':
                $payload = app(TransactionReportService::class)->getTransactions($request);
                $records = $payload->items();
                $header = ['ID', 'User', 'Mobile', 'Amount', 'Type', 'Description', 'Date'];
                foreach ($records as $row) {
                    $data[] = [
                        $row->id,
                        $row->user ? $row->user->first_name . ' ' . $row->user->last_name : '',
                        $row->user ? $row->user->mobile : '',
                        $row->amount_with_sign,
                        $row->type_farsi,
                        $row->description,
                        $row->created_at_jalali
                    ];
                }
                break;

            case 'redemptions':
                $payload = app(RedemptionReportService::class)->getRedemptions($request);
                $records = $payload->items();
                $header = ['ID', 'User', 'Mobile', 'Reward', 'Cost', 'Status', 'Date'];
                foreach ($records as $row) {
                    $data[] = [
                        $row->id,
                        $row->user ? $row->user->first_name . ' ' . $row->user->last_name : '',
                        $row->user ? $row->user->mobile : '',
                        $row->reward ? $row->reward->name : '',
                        $row->points_cost,
                        $row->status_farsi,
                        $row->created_at_jalali
                    ];
                }
                break;

            case 'users':
                $payload = app(UserReportService::class)->getUsers($request);
                $records = $payload->items();
                $header = ['User', 'Mobile', 'Type', 'Status', 'Points', 'Joined Date'];
                foreach ($records as $row) {
                    $data[] = [
                        $row->first_name . ' ' . $row->last_name,
                        $row->mobile,
                        $row->user_type,
                        $row->status ? $row->status->name : '',
                        $row->current_points,
                        $row->created_at_jalali
                    ];
                }
                break;

            case 'products':
                $payload = app(ProductReportService::class)->getProducts($request);
                $records = isset($payload['data']) ? $payload['data'] : (method_exists($payload, 'items') ? $payload->items() : collect($payload));
                $header = ['Name/Serial/Model', 'Status', 'Date'];
                foreach ($records as $row) {
                    $data[] = [
                        $row->name ?? $row->serial ?? ($row->model ? $row->model->name : ''),
                        $row->status ?? '',
                        $row->created_at_jalali ?? ''
                    ];
                }
                break;

            case 'surveys':
                $payload = app(SurveyReportService::class)->getSurveys($request);
                $records = $payload->items();
                $header = ['Title', 'Type', 'Status', 'Participants', 'Average Score', 'Date'];
                foreach ($records as $row) {
                    $data[] = [
                        $row->title,
                        $row->type_farsi,
                        $row->status_farsi,
                        $row->participants_count,
                        $row->average_score,
                        $row->created_at_jalali
                    ];
                }
                break;
        }

        $callback = function () use ($data, $header) {
            $file = fopen('php://output', 'w');
            // Add BOM to fix UTF-8 in Excel
            fputs($file, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));
            fputcsv($file, $header);
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        $fileName = "export_{$tab}_" . date('Ymd_His') . ".csv";

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }
}
