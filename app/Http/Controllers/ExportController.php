<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function transactions(Request $request)
    {
        return Excel::download(new TransactionsExport(auth()->id()), 'transactions.xlsx');
    }
}
