<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();                                    // شناسه جلسه کاربری
            $table->foreignId('user_id')->constrained('users'); // کاربر
            $table->enum('session_type', ['club_visit', 'dashboard', 'product_view']); // نوع جلسه
            $table->string('page_url', 500);                 // آدرس صفحه بازدید شده
            $table->timestamp('started_at')->useCurrent();   // زمان شروع بازدید
            $table->timestamp('ended_at')->nullable();       // زمان پایان بازدید
            $table->unsignedInteger('duration_seconds')->default(0); // مدت بازدید (ثانیه)
            $table->string('ip_address', 45);                // آی‌پی کاربر
            $table->text('user_agent')->nullable();          // اطلاعات مرورگر و دستگاه
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            
            $table->index(['user_id', 'session_type']);      // ایندکس برای تحلیل رفتار کاربر
            $table->index(['started_at', 'ended_at']);       // ایندکس برای تاریخ‌ها
            $table->index('duration_seconds');               // ایندکس برای تحلیل مدت زمان
            $table->index('ip_address');                     // ایندکس برای امنیت
            $table->index('page_url');                       // ایندکس برای تحلیل صفحات پربازدید
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_sessions');
    }
};