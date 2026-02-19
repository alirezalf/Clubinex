<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LockScreenController extends Controller
{
    public function show()
    {
        // اگر قفل نیست، ریدایرکت به داشبورد
        if (!session('locked') && Auth::check()) {
            return redirect()->route('dashboard');
        }
        
        // اگر کاربر لاگین نیست، ریدایرکت به لاگین
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/LockScreen', [
            'user' => [
                'name' => Auth::user()->full_name,
                'avatar' => Auth::user()->avatar,
                'email' => Auth::user()->email
            ]
        ]);
    }

    public function unlock(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (Hash::check($request->password, Auth::user()->password)) {
            session(['locked' => false]);
            session(['last_activity_time' => now()->timestamp]);
            
            $intended = session('lock_redirect', route('dashboard'));
            session()->forget('lock_redirect');
            
            return redirect($intended);
        }

        return back()->withErrors(['password' => 'رمز عبور اشتباه است.']);
    }
}