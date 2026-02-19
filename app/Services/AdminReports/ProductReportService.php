<?php

namespace App\Services\AdminReports;

use App\Models\Product;
use App\Models\ProductRegistration;
use App\Models\ProductSerial;
use Illuminate\Http\Request;
use Morilog\Jalali\Jalalian;

class ProductReportService
{
    public function getProducts(Request $request)
    {
        $reportType = $request->input('type', 'inventory'); // inventory, serials, registrations

        if ($reportType === 'serials') {
            return $this->getSerials($request);
        } elseif ($reportType === 'registrations') {
            return $this->getRegistrations($request);
        } else {
            return $this->getInventory($request);
        }
    }

    private function getInventory(Request $request)
    {
        $query = Product::with('category')
            ->withCount(['serials', 'serials as used_serials_count' => function ($q) {
                $q->where('is_used', true);
            }])
            ->latest();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%")
                  ->orWhere('model_name', 'like', "%{$request->search}%");
        }

        return $query->paginate(15)->withQueryString();
    }

    private function getSerials(Request $request)
    {
        $query = ProductSerial::with(['user', 'product.category'])->latest();

        if ($request->search) {
            $query->where('serial_code', 'like', "%{$request->search}%")
                  ->orWhereHas('product', function ($q) use ($request) {
                      $q->where('title', 'like', "%{$request->search}%");
                  });
        }

        if ($request->status && $request->status !== 'all') {
            if ($request->status === 'used') {
                $query->where('is_used', true);
            } elseif ($request->status === 'free') {
                $query->where('is_used', false);
            }
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($ps) {
            $ps->used_at_jalali = $ps->used_at ? Jalalian::fromDateTime($ps->used_at)->format('Y/m/d H:i') : '-';
            return $ps;
        });

        return $data;
    }

    private function getRegistrations(Request $request)
    {
        $query = ProductRegistration::with(['user', 'category', 'admin'])->latest();

        if ($request->search) {
            $query->where('serial_code', 'like', "%{$request->search}%")
                  ->orWhere('product_name', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function ($q) use ($request) {
                      $q->where('mobile', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($pr) {
            $pr->created_at_jalali = $pr->created_at_jalali;
            $pr->status_farsi = $pr->status_farsi;
            return $pr;
        });

        return $data;
    }
}
