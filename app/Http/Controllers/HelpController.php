<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\HelpCategory;

class HelpController extends Controller
{
    public function index()
    {
        $categories = HelpCategory::with('articles')->orderBy('sort_order')->get();

        return Inertia::render('Help/Index', [
            'isAdmin' => auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']),
            'categories' => $categories,
        ]);
    }
}
