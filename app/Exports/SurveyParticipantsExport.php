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
use Morilog\Jalali\Jalalian;

class SurveyParticipantsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
{
    protected $query;
    protected $surveyTitle;

    public function __construct($query, $surveyTitle)
    {
        $this->query = $query;
        $this->surveyTitle = $surveyTitle;
    }

    public function query()
    {
        return $this->query;
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
            $row->id,
            $row->full_name,
            $row->mobile,
            $row->national_code ?? '-',
            $row->province?->name ?? '-',
            $row->city?->name ?? '-',
            $row->address ?? '-',
            $row->surveyAnswers->sum('score'),
            $row->surveyAnswers->first() ? Jalalian::fromDateTime($row->surveyAnswers->first()->created_at)->format('Y/m/d H:i') : '-',
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
