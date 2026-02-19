<?php

namespace App\Services\AdminReports;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserReportService
{
    public function getUsers(Request $request)
    {
        $query = User::with(['club', 'status', 'province', 'city'])
            ->withCount(['surveyAnswers as participated_surveys_count' => function ($q) {
                $q->select(DB::raw('count(distinct survey_id)'));
            }]);

        if ($request->search) {
            $query->where('mobile', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%");
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($u) {
            $u->created_at_jalali = $u->created_at_jalali;
            $u->surveys_count = $u->participated_surveys_count ?? 0;
            return $u;
        });

        return $data;
    }
}
