<?php

namespace App\Services\Report;

use App\DTOs\Report\ReportRequestDTO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class QueryBuilderService
{
    public function __construct(
        private readonly EntityService $entityService,
        private readonly AdvancedFilterService $advancedFilterService
    ) {}

    public function buildQuery(Request $request): ?object
    {
        $request->validate([
            'table' => 'required|string',
            'fields' => 'required|array|min:1',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'advanced_filters' => 'nullable|array',
        ]);

        $table = $request->table;
        $fields = $request->fields;

        $allowedTables = $this->entityService->getAllowedTables();

        if (!in_array($table, $allowedTables) || !Schema::hasTable($table)) {
            abort(403, 'دسترسی غیرمجاز به جدول');
        }

        $validFields = array_filter($fields, function($field) use ($table) {
            return Schema::hasColumn($table, $field);
        });

        if (empty($validFields)) {
            return null;
        }

        $query = DB::table($table)->select($validFields);

        $dateColumn = $this->detectDateColumn($table);

        if ($dateColumn) {
            if ($request->date_from) {
                $query->whereDate($dateColumn, '>=', $request->date_from);
            }
            if ($request->date_to) {
                $query->whereDate($dateColumn, '<=', $request->date_to);
            }
        }

        if ($request->advanced_filters) {
            $this->advancedFilterService->apply($query, $request->advanced_filters, $validFields);
        }

        return $query;
    }

    private function detectDateColumn(string $table): ?string
    {
        $dateColumns = ['created_at', 'registered_at', 'used_at', 'submitted_at', 'updated_at'];

        foreach ($dateColumns as $column) {
            if (Schema::hasColumn($table, $column)) {
                return $column;
            }
        }

        return null;
    }
}
