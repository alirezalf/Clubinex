<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class CheckSetup
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip setup check for setup routes to avoid infinite loops
        if ($request->is('setup*') || $request->is('install*')) {
            return $next($request);
        }

        // Check if application needs setup
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('users') || \Illuminate\Support\Facades\DB::table('users')->count() === 0) {
                return redirect()->route('setup.index');
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('CheckSetup Middleware Error: ' . $e->getMessage());
            // Database might not be connected or migrated yet
            // In a real scenario, we might redirect to a deeper install route,
            // but for now let's just ignore to prevent crashing the whole app
        }

        return $next($request);
    }
}
