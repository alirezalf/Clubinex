<?php

namespace App\Exports;

use App\Models\PointTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $userId;

    public function __construct($userId = null)
    {
        $this->userId = $userId;
    }

    public function collection()
    {
        $query = PointTransaction::query()->with('user');
        if ($this->userId) {
            $query->where('user_id', $this->userId);
        }
        return $query->get();
    }

    public function headings(): array
    {
        return [
            'شناسه',
            'نام کاربر',
            'نوع تراکنش',
            'مقدار',
            'توضیحات',
            'تاریخ'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->user->full_name,
            $transaction->getTypeFarsi(),
            $transaction->amount,
            $transaction->description,
            $transaction->created_at_jalali,
        ];
    }
}