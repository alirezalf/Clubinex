<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\HelpCategory;

class HelpController extends Controller
{
    public function index()
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('help_categories_with_articles', 86400, function() {
            return HelpCategory::with('articles')->orderBy('sort_order')->get();
        });

        return Inertia::render('Help/Index', [
            'isAdmin' => auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']),
            'categories' => $categories,
        ]);
    }
}
