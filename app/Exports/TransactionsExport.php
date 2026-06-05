<?php

namespace App\Exports;

use App\Models\PointTransaction;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromQuery, WithHeadings, WithMapping
{
    protected $userId;

    public function __construct($userId = null)
    {
        $this->userId = $userId;
    }

    public function query()
    {
        $query = PointTransaction::query()->with('user');
        if ($this->userId) {
            $query->where('user_id', $this->userId);
        }
        return $query;
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
            $transaction->user->full_name ?? '-',
            $transaction->getTypeFarsi(),
            $transaction->amount,
            $transaction->description,
            $transaction->created_at_jalali,
        ];
    }
}
