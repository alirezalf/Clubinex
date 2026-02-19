<?php

namespace App\Imports;

use App\Models\ProductSerial;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductSerialsImport implements ToModel, WithHeadingRow
{
    protected $productId;

    public function __construct($productId)
    {
        $this->productId = $productId;
    }

    public function model(array $row)
    {
        // فرض بر این است که فایل اکسل ستونی با نام serial_code دارد
        if (!isset($row['serial_code'])) {
            return null;
        }

        return new ProductSerial([
            'product_id'  => $this->productId,
            'serial_code' => $row['serial_code'],
            'is_used'     => false,
        ]);
    }
}
