<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SAFETY: Only truncate in local environment to prevent data loss in production
        if (app()->isLocal()) {
            if (Schema::hasTable('jobs')) {
                DB::table('jobs')->truncate();
            }
            if (Schema::hasTable('failed_jobs')) {
                DB::table('failed_jobs')->truncate();
            }
        }
    }

    public function down(): void
    {
        // No action
    }
};