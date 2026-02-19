<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();                                    // شناسه تراکنش امتیازی
            $table->foreignId('user_id')->constrained('users'); // کاربر دریافت‌کننده/پرداخت‌کننده
            $table->enum('type', ['earn', 'spend', 'expire', 'adjust']); // نوع تراکنش
            $table->integer('amount');                       // مقدار امتیاز (مثبت: کسب، منفی: خرج)
            $table->foreignId('point_rule_id')->nullable()->constrained('point_rules'); // قانون ایجاد‌کننده
            $table->string('reference_type', 100)->nullable(); // نوع مرجع (Survey, ClubRegistration, ...)
            $table->unsignedBigInteger('reference_id')->nullable(); // شناسه مرجع
            $table->string('description', 500)->nullable();  // توضیح تراکنش برای کاربر
            $table->integer('balance_after');                // مانده کاربر پس از این تراکنش
            $table->timestamp('expires_at')->nullable();     // تاریخ انقضای این امتیاز
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['user_id', 'type', 'created_at']); // ایندکس برای گزارش‌گیری کاربر
            $table->index(['reference_type', 'reference_id']); // ایندکس برای پیگیری مراجع
            $table->index(['expires_at', 'type']);           // ایندکس برای امتیازات در حال انقضا
            $table->index('point_rule_id');                  // ایندکس برای تحلیل قوانین
            $table->index('balance_after');                  // ایندکس برای تحلیل مانده‌ها
            
            // ایندکس اضافه شده برای گزارش‌گیری (ادغام شده)
            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('point_transactions');
    }
};