<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SurveyParticipantsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
{
    protected $data;
    protected $surveyTitle;

    public function __construct($data, $surveyTitle)
    {
        $this->data = $data;
        $this->surveyTitle = $surveyTitle;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'شناسه کاربر',
            'نام و نام خانوادگی',
            'شماره موبایل',
            'کد ملی',
            'استان',
            'شهر',
            'آدرس کامل',
            'نمره/امتیاز کل',
            'تاریخ آخرین شرکت'
        ];
    }

    public function map($row): array
    {
        return [
            $row['id'],
            $row['full_name'],
            $row['mobile'],
            $row['national_code'] ?? '-',
            $row['province'] ?? '-',
            $row['city'] ?? '-',
            $row['address'] ?? '-',
            $row['score'],
            $row['date'],
        ];
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