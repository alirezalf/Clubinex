<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ActivityLog;
use App\Models\SmsLog;
use App\Models\EmailLog;
use App\Models\UserSession;
use Illuminate\Support\Facades\DB;

class PruneSystem extends Command
{
    /**
     * نام و امضای دستور کنسول
     *
     * @var string
     */
    protected $signature = 'app:prune-system {--days=90 : تعداد روزهایی که داده‌ها نگهداری می‌شوند}';

    /**
     * توضیحات دستور
     *
     * @var string
     */
    protected $description = 'پاکسازی لاگ‌ها و داده‌های قدیمی سیستم برای بهینه‌سازی دیتابیس';

    /**
     * اجرای دستور
     */
    public function handle()
    {
        $days = $this->option('days');
        $date = now()->subDays($days);
        $sessionDate = now()->subDays(30); // سشن‌ها عمر کوتاه‌تری دارند

        $this->info("شروع پاکسازی داده‌های قدیمی‌تر از {$days} روز...");

        // 1. پاکسازی لاگ فعالیت‌ها
        $deletedActivity = ActivityLog::where('created_at', '<', $date)->delete();
        $this->info("- {$deletedActivity} رکورد از لاگ فعالیت‌ها حذف شد.");

        // 2. پاکسازی لاگ پیامک‌ها
        $deletedSms = SmsLog::where('created_at', '<', $date)->delete();
        $this->info("- {$deletedSms} رکورد از لاگ پیامک‌ها حذف شد.");

        // 3. پاکسازی لاگ ایمیل‌ها
        $deletedEmail = EmailLog::where('created_at', '<', $date)->delete();
        $this->info("- {$deletedEmail} رکورد از لاگ ایمیل‌ها حذف شد.");

        // 4. پاکسازی نوتیفیکیشن‌های خوانده شده
        $deletedNotifs = DB::table('notifications')
            ->where('created_at', '<', $date)
            ->whereNotNull('read_at')
            ->delete();
        $this->info("- {$deletedNotifs} رکورد از نوتیفیکیشن‌ها حذف شد.");

        // 5. پاکسازی نشست‌های قدیمی (با استفاده از متد مدل یا مستقیم)
        $deletedSessions = UserSession::where('started_at', '<', $sessionDate)->delete();
        $this->info("- {$deletedSessions} رکورد از نشست‌های کاربران (قدیمی‌تر از ۳۰ روز) حذف شد.");

        $this->newLine();
        $this->info('پاکسازی سیستم با موفقیت انجام شد.');
    }
}