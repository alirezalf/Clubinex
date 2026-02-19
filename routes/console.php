<?php

use Illuminate\Support\Facades\Schedule;

// فعلاً دستورات زمان‌بندی شده را غیرفعال می‌کنیم تا از خطاهای احتمالی در محیط توسعه جلوگیری شود
// Schedule::command('app:prune-system')->dailyAt('03:00');
// Schedule::command('sanctum:prune-expired --hours=24')->daily();
// Schedule::command('tickets:auto-close')->hourly();