<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Exports\DynamicReportExport;
use App\Services\Report\EntityService;
use App\Services\Report\FieldService;
use App\Services\Report\QueryBuilderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Schema;

class DynamicReportController extends Controller
{
    public function __construct(
        private readonly EntityService $entityService,
        private readonly FieldService $fieldService,
        private readonly QueryBuilderService $queryBuilderService
    ) {}

    /**
     * صفحه اصلی گزارشساز پیشرفته
     */
    public function index()
    {
        return Inertia::render('Admin/Reports/Dynamic', [
            'entities' => $this->entityService->getEntities()
        ]);
    }

    /**
     * دریافت ستونهای یک جدول خاص
     */
    public function getTableColumns($table)
    {
        $allowedTables = $this->entityService->getAllowedTables();

        if (!in_array($table, $allowedTables) || !Schema::hasTable($table)) {
            return response()->json(['error' => 'جدول مورد نظر یافت نشد یا دسترسی غیرمجاز است'], 404);
        }

        return response()->json($this->fieldService->getFieldsFor($table));
    }

    /**
     * دریافت دادهها بر اساس درخواست
     */
    public function fetchData(Request $request)
    {
        try {
            $query = $this->queryBuilderService->buildQuery($request);

            if (!$query) {
                return response()->json(['data' => [], 'total' => 0]);
            }

            $sortField = $request->input('sort_by', 'created_at');
            $sortDir = $request->input('sort_dir', 'desc');

            if (Schema::hasColumn($request->table, $sortField)) {
                $query->orderBy($sortField, $sortDir);
            } else {
                $query->orderBy('id', $sortDir);
            }

            $data = $query->paginate($request->input('per_page', 20));

            return response()->json($data);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Report fetch error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()], 500);
        }
    }

    /**
     * درخواست خروجی اکسل گزارش در Background
     */
    public function export(Request $request)
    {
        try {
            $allFields = $this->fieldService->getFieldsFor($request->table);
            $selectedFields = [];
            foreach ($request->fields ?? [] as $fieldKey) {
                $selectedFields[$fieldKey] = $allFields[$fieldKey] ?? $fieldKey;
            }

            $query = $this->queryBuilderService->buildQuery($request);

            if (!$query) {
                return response()->json(['error' => 'بدون داده'], 404);
            }

            $sortField = $request->input('sort_by', 'created_at');
            $sortDir = $request->input('sort_dir', 'desc');

            if (Schema::hasColumn($request->table, $sortField)) {
                $query->orderBy($sortField, $sortDir);
            } else {
                $query->orderBy('id', $sortDir);
            }

            $showRowNumber = filter_var($request->input('show_row_number', false), FILTER_VALIDATE_BOOLEAN);

            $fileName = 'custom_report_' . $request->table . '_' . date('Ymd_His') . '.xlsx';

            if (ob_get_length()) {
                ob_end_clean();
            }

            return Excel::download(new DynamicReportExport($query, $selectedFields, $showRowNumber), $fileName);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Report export error: ' . $e->getMessage());
            return response()->json(['error' => 'خطا در خروجی: ' . $e->getMessage()], 500);
        }
    }
}
