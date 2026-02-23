<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($q2) use ($request) {
                      $q2->where('first_name', 'like', "%{$request->search}%")
                         ->orWhere('last_name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->action && $request->action !== 'all') {
            $query->where('action_group', $request->action);
        }

        if ($request->date) {
            if ($request->has('hour') && $request->hour !== null && $request->hour !== '') {
                 $startTime = Carbon::parse($request->date)->setHour($request->hour)->setMinute(0)->setSecond(0);
                 $endTime = Carbon::parse($request->date)->setHour($request->hour)->setMinute(59)->setSecond(59);

                 $query->whereBetween('created_at', [$startTime, $endTime]);
            } else {
                 $query->whereDate('created_at', $request->date);
            }
        }

        $logs = $query->latest()->paginate(20)->withQueryString();

        $logs->getCollection()->transform(function ($log) {
            $log->created_at_jalali = $log->created_at_jalali;
            return $log;
        });

        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'date', 'hour', 'action'])
        ]);
    }
}
