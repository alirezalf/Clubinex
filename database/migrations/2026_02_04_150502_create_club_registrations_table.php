<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('club_registrations', function (Blueprint $table) {
            $table->id();                                    // شناسه درخواست عضویت
            $table->foreignId('user_id')->constrained('users'); // کاربر درخواست‌دهنده
            $table->foreignId('club_id')->constrained('clubs'); // باشگاه مورد درخواست
            $table->timestamp('requested_at')->useCurrent(); // زمان درخواست عضویت
            $table->timestamp('approved_at')->nullable();    // زمان تأیید عضویت
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // وضعیت درخواست
            $table->foreignId('approved_by')->nullable()->constrained('users'); // مدیر تأییدکننده
            $table->text('notes')->nullable();               // یادداشت‌های مدیر
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->unique(['user_id', 'club_id', 'status']); // هر کاربر فقط یک درخواست فعال برای هر باشگاه
            $table->index(['status', 'requested_at']);       // ایندکس برای فیلتر درخواست‌ها
            $table->index(['user_id', 'approved_at']);       // ایندکس برای پیگیری کاربر
            $table->index('approved_by');                    // ایندکس برای گزارش مدیران
        });
    }

    public function down(): void {
        Schema::dropIfExists('club_registrations');
    }
};