<?php

namespace App\DTOs\Report;

use Illuminate\Http\Request;

class ReportRequestDTO
{
    public string $table;
    public array $fields;
    public ?string $date_from;
    public ?string $date_to;
    public ?array $advanced_filters;
    public string $sort_by;
    public string $sort_dir;
    public int $per_page;
    public bool $show_row_number;

    public function __construct(
        string $table,
        array $fields,
        ?string $date_from,
        ?string $date_to,
        ?array $advanced_filters,
        string $sort_by,
        string $sort_dir,
        int $per_page,
        bool $show_row_number
    ) {
        $this->table = $table;
        $this->fields = $fields;
        $this->date_from = $date_from;
        $this->date_to = $date_to;
        $this->advanced_filters = $advanced_filters;
        $this->sort_by = $sort_by;
        $this->sort_dir = $sort_dir;
        $this->per_page = $per_page;
        $this->show_row_number = $show_row_number;
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            table: $request->table,
            fields: $request->fields,
            date_from: $request->date_from,
            date_to: $request->date_to,
            advanced_filters: $request->advanced_filters,
            sort_by: $request->input('sort_by', 'created_at'),
            sort_dir: $request->input('sort_dir', 'desc'),
            per_page: $request->input('per_page', 20),
            show_row_number: $request->boolean('show_row_number')
        );
    }
}
