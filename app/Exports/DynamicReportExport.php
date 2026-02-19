<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DynamicReportExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
{
    protected $query;
    protected $fields;
    protected $showRowNumber;
    private $rowNumber = 0;

    public function __construct($query, $fields, $showRowNumber = false)
    {
        $this->query = $query;
        $this->fields = $fields;
        $this->showRowNumber = filter_var($showRowNumber, FILTER_VALIDATE_BOOLEAN);
    }

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        $headings = array_values($this->fields);
        
        if ($this->showRowNumber) {
            array_unshift($headings, 'ردیف');
        }
        
        return $headings;
    }

    public function map($row): array
    {
        $mappedRow = [];
        
        if ($this->showRowNumber) {
            $this->rowNumber++;
            $mappedRow[] = $this->rowNumber;
        }

        foreach (array_keys($this->fields) as $fieldKey) {
            // تبدیل مقادیر خاص (مثلا تاریخ یا وضعیت) اگر نیاز بود
            $val = $row->$fieldKey ?? '-';
            $mappedRow[] = $val;
        }
        
        return $mappedRow;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->getDelegate()->setRightToLeft(true);
            },
        ];
    }
}