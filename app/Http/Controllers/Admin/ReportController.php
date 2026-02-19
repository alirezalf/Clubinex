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
}