<?php

use Illuminate\Support\Facades\Schedule;

// فعلاً دستورات زمان‌بندی شده را غیرفعال می‌کنیم تا از خطاهای احتمالی در محیط توسعه جلوگیری شود
// Schedule::command('app:prune-system')->dailyAt('03:00');
// Schedule::command('sanctum:prune-expired --hours=24')->daily();
// Schedule::command('tickets:auto-close')->hourly();

// دستورات منقضی کردن امتیاز و تگ کردن کاربران به صورت داخلی (Middleware/Events) مدیریت می‌شوند.
// Schedule::command('backup:database')->dailyAt('02:00');
// Schedule::command('points:expire')->dailyAt('01:00');
// Schedule::command('users:tag')->dailyAt('04:00');
