<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        return Inertia::render('Help/Index', [
            'isAdmin' => auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']),
        ]);
    }
}
