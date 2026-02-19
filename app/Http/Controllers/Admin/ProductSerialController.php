<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductSerial;
use App\Imports\ProductSerialsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ProductSerialController extends Controller
{
    public function index($id)
    {
        $serials = ProductSerial::with('user:id,first_name,last_name,mobile')
            ->where('product_id', $id)
            ->latest()
            ->paginate(20);
            
        $serials->getCollection()->transform(function($s) {
            $s->used_at_jalali = $s->used_at ? \Morilog\Jalali\Jalalian::fromDateTime($s->used_at)->format('Y/m/d H:i') : null;
            return $s;
        });

        return response()->json($serials);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'serial_code' => 'required|string|unique:product_serials,serial_code',
        ]);

        ProductSerial::create([
            'product_id' => $id,
            'serial_code' => $request->serial_code,
            'is_used' => false
        ]);

        return back()->with('message', 'سریال جدید اضافه شد.');
    }

    public function generate(Request $request, $id)
    {
        $request->validate([
            'count' => 'required|integer|min:1|max:1000',
        ]);

        $product = Product::findOrFail($id);
        $count = $request->count;
        $createdCount = 0;

        for ($i = 0; $i < $count; $i++) {
            $serial = $this->generateSecureSerialCode($product->model_name);
            try {
                ProductSerial::create([
                    'product_id' => $id,
                    'serial_code' => $serial,
                    'is_used' => false
                ]);
                $createdCount++;
            } catch (\Exception $e) { }
        }

        return back()->with('message', "تعداد {$createdCount} سریال با موفقیت تولید شد.");
    }

    public function destroy($id)
    {
        $serial = ProductSerial::findOrFail($id);
        if ($serial->is_used) {
            return back()->with('error', 'این سریال استفاده شده است و نمی‌توان آن را حذف کرد.');
        }
        $serial->delete();
        return back()->with('message', 'سریال حذف شد.');
    }

    public function import(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        try {
            Excel::import(new ProductSerialsImport($id), $request->file('file'));
            return back()->with('message', 'سریال‌ها با موفقیت وارد شدند.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در وارد کردن فایل: ' . $e->getMessage());
        }
    }

    private function generateSecureSerialCode($modelName)
    {
        $prefix = $modelName ? strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $modelName)) : 'PROD';
        if (strlen($prefix) > 6) $prefix = substr($prefix, 0, 6);
        
        $randomPart = strtoupper(Str::random(12));
        $checksum = strtoupper(substr(md5($prefix . $randomPart . config('app.key')), 0, 2));
        $formattedRandom = implode('-', str_split($randomPart . $checksum, 4));

        return $prefix . '-' . $formattedRandom;
    }
}