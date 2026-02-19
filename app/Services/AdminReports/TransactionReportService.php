<?php

namespace App\Services\AdminReports;

use App\Models\PointTransaction;
use Illuminate\Http\Request;

class TransactionReportService
{
    public function getTransactions(Request $request)
    {
        $query = PointTransaction::with('user')->latest();

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('mobile', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($tx) {
            // Assuming these accessors or methods exist on the model
            // If they are computed in the controller previously, we might need to move that logic here or keep it on the model
            // The original controller code accessed attributes like created_at_jalali which are likely accessors.
            // It also called getReferenceLabel which was a private method in the controller.
            
            $tx->created_at_jalali = $tx->created_at_jalali;
            $tx->type_farsi = $tx->getTypeFarsi();
            $tx->amount_with_sign = $tx->amount_with_sign;
            $tx->reference_label = $this->getReferenceLabel($tx->reference_type);
            
            return $tx;
        });

        return $data;
    }

    private function getReferenceLabel($type)
    {
        $map = [
            'App\Models\Survey' => 'نظرسنجی',
            'App\Models\ProductRegistration' => 'ثبت محصول',
            'App\Models\ClubRegistration' => 'عضویت باشگاه',
            'App\Models\Reward' => 'جایزه',
            'App\Models\LuckyWheel' => 'گردونه',
            'App\Models\ProductSerial' => 'سریال محصول',
            'App\Models\ReferralNetwork' => 'معرفی دوست',
        ];

        foreach ($map as $key => $label) {
            if (str_contains($type, class_basename($key))) {
                return $label;
            }
        }

        return $map[$type] ?? 'سایر';
    }
}
