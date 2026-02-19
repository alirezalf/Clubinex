<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SystemSetting;

class CheckSessionTimeout
{
    public function handle(Request $request, Closure $next)
    {
        // مسیرهای استثنا (مثل خود صفحه قفل و عملیات بازگشایی)
        if ($request->routeIs('lock-screen') || $request->routeIs('lock-screen.unlock') || $request->routeIs('logout')) {
            return $next($request);
        }

        if (auth()->check()) {
            // اگر سشن قفل شده باشد، ریدایرکت کن
            if (session('locked')) {
                return redirect()->route('lock-screen');
            }

            $timeout = (int) SystemSetting::getValue('security', 'session_timeout', 30); // دقیقه
            
            // اگر تنظیم روی 0 باشد یعنی غیرفعال
            if ($timeout > 0) {
                $lastActivity = session('last_activity_time');
                $now = now()->timestamp;

                if ($lastActivity && ($now - $lastActivity > $timeout * 60)) {
                    session(['locked' => true]);
                    session(['lock_redirect' => $request->url()]);
                    return redirect()->route('lock-screen');
                }

                session(['last_activity_time' => $now]);
            }
        }

        return $next($request);
    }
}