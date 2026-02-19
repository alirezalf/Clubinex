<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sms_logs', function (Blueprint $table) {
            $table->id();                                    // شناسه لاگ SMS
            $table->foreignId('user_id')->nullable()->constrained('users'); // کاربر دریافت‌کننده
            $table->string('mobile', 11);                    // شماره موبایل مقصد
            $table->text('message');                         // متن پیامک
            $table->string('provider', 50)->nullable();      // سرویس‌دهنده SMS
            $table->string('message_id', 100)->nullable();   // شناسه پیام در سرویس‌دهنده
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed'])->default('pending'); // وضعیت ارسال
            $table->string('error_message', 500)->nullable(); // پیام خطا (در صورت وجود)
            $table->json('provider_response')->nullable();   // پاسخ سرویس‌دهنده (JSON)
            $table->integer('cost')->nullable();             // هزینه ارسال (ریال)
            $table->string('ip_address', 45)->nullable();    // آی‌پی درخواست‌دهنده
            $table->string('sms_type', 50)->default('otp');  // نوع SMS (otp, notification, etc.)
            $table->timestamp('sent_at')->nullable();        // زمان ارسال
            $table->timestamp('delivered_at')->nullable();   // زمان تحویل
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            
            $table->index(['user_id', 'created_at']);        // ایندکس برای گزارش‌گیری
            $table->index(['mobile', 'status']);             // ایندکس برای پیگیری
            $table->index('sms_type');                       // ایندکس برای تحلیل انواع SMS
            $table->index(['sent_at', 'delivered_at']);      // ایندکس برای محاسبه زمان ارسال
        });
    }

    public function down(): void {
        Schema::dropIfExists('sms_logs');
    }
};