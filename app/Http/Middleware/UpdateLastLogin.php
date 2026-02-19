<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateLastLogin
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            // آپدیت فقط اگر یک ساعت گذشته باشد برای کاهش کوئری
            if (!$user->last_login_at || $user->last_login_at->diffInHours(now()) > 1) {
                $user->update(['last_login_at' => now()]);
            }
        }

        return $next($request);
    }
}