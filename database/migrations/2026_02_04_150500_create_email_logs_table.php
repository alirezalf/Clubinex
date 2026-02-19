<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. جدول تم‌های ایمیل (ادغام شده برای رعایت ترتیب وابستگی)
        Schema::create('email_themes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // نام تم (مثلا: رسمی، تولد، خبرنامه)
            $table->longText('content'); // کد HTML قالب (با متغیر {content})
            $table->text('styles')->nullable(); // CSS های اضافه (اختیاری)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. جدول لاگ ایمیل‌ها
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();                                    // شناسه لاگ ایمیل
            $table->foreignId('user_id')->nullable()->constrained('users'); // کاربر دریافت‌کننده
            $table->string('email', 150);                    // آدرس ایمیل مقصد
            $table->string('subject', 200);                  // موضوع ایمیل
            $table->text('content')->nullable();             // محتوای ایمیل
            $table->json('attachments')->nullable();         // فایل‌های پیوست (JSON)
            $table->string('provider', 50)->nullable();      // سرویس‌دهنده ایمیل
            $table->string('message_id', 100)->nullable();   // شناسه ایمیل در سرویس‌دهنده
            $table->enum('status', ['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed'])->default('pending'); // وضعیت ارسال
            $table->string('error_message', 500)->nullable(); // پیام خطا (در صورت وجود)
            $table->json('provider_response')->nullable();   // پاسخ سرویس‌دهنده (JSON)
            $table->timestamp('sent_at')->nullable();        // زمان ارسال
            $table->timestamp('delivered_at')->nullable();   // زمان تحویل
            $table->timestamp('opened_at')->nullable();      // زمان باز شدن
            $table->timestamp('clicked_at')->nullable();     // زمان کلیک روی لینک
            $table->string('ip_address', 45)->nullable();    // آی‌پی بازکننده
            $table->string('email_type', 50)->default('notification'); // نوع ایمیل
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            
            $table->index(['user_id', 'created_at']);        // ایندکس برای گزارش‌گیری
            $table->index(['email', 'status']);              // ایندکس برای پیگیری
            $table->index('email_type');                     // ایندکس برای تحلیل انواع ایمیل
            $table->index(['sent_at', 'delivered_at']);      // ایندکس برای محاسبه زمان ارسال
        });
    }

    public function down(): void {
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('email_themes');
    }
};