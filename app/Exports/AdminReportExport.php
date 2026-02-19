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

class AdminReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
{
    protected $data;
    protected $type;

    public function __construct($data, $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        switch ($this->type) {
            case 'transactions':
                return ['شناسه', 'کاربر', 'موبایل', 'نوع تراکنش', 'مبلغ (امتیاز)', 'توضیحات', 'تاریخ'];
            case 'redemptions':
                return ['شناسه', 'کاربر', 'موبایل', 'نام جایزه', 'امتیاز خرج شده', 'وضعیت', 'کد رهگیری', 'تاریخ'];
            case 'users':
                return ['شناسه', 'نام', 'نام خانوادگی', 'موبایل', 'کد ملی', 'باشگاه', 'امتیاز فعلی', 'تاریخ عضویت'];
            default:
                return [];
        }
    }

    public function map($row): array
    {
        switch ($this->type) {
            case 'transactions':
                return [
                    $row->id,
                    $row->user ? $row->user->full_name : 'ناشناس',
                    $row->user ? $row->user->mobile : '-',
                    $row->getTypeFarsi(),
                    $row->amount,
                    $row->description,
                    $row->created_at_jalali,
                ];
            case 'redemptions':
                return [
                    $row->id,
                    $row->user ? $row->user->full_name : 'ناشناس',
                    $row->user ? $row->user->mobile : '-',
                    $row->reward ? $row->reward->title : '-',
                    $row->points_spent,
                    $row->status_farsi,
                    $row->tracking_code ?? '-',
                    $row->created_at_jalali,
                ];
            case 'users':
                return [
                    $row->id,
                    $row->first_name,
                    $row->last_name,
                    $row->mobile,
                    $row->national_code,
                    $row->club ? $row->club->name : '-',
                    $row->current_points,
                    $row->created_at_jalali,
                ];
            default:
                return [];
        }
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
