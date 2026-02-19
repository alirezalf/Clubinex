<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();                                    // شناسه لاگ
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // کاربر انجام‌دهنده
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete(); // مدیر انجام‌دهنده
            $table->string('action', 100);                   // نوع فعالیت (مثلا: user.login)
            
            // لیست کامل گروه‌های فعالیت (ادغام شده و کامل)
            $table->enum('action_group', [
                'user', 'point', 'survey', 'club', 'referral', 'wheel', 'system', 
                'reward', 'product', 'sms', 'email', 'agent', 'ticket'
            ]); 
            
            $table->text('description');                     // توضیح کامل فعالیت (فارسی)
            $table->string('model_type', 100)->nullable();   // نوع مدل مرتبط
            $table->unsignedBigInteger('model_id')->nullable(); // شناسه مدل مرتبط
            $table->json('old_values')->nullable();          // مقادیر قدیمی (برای آپدیت)
            $table->json('new_values')->nullable();          // مقادیر جدید (برای آپدیت)
            $table->string('ip_address', 45)->nullable();    // آی‌پی انجام‌دهنده
            $table->text('user_agent')->nullable();          // اطلاعات مرورگر
            $table->string('location', 100)->nullable();     // موقعیت جغرافیایی
            $table->enum('device_type', ['web', 'mobile', 'tablet', 'unknown'])->default('unknown'); // نوع دستگاه
            $table->enum('severity', ['info', 'warning', 'error', 'critical'])->default('info'); // سطح اهمیت
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            // ایندکس‌گذاری برای افزایش سرعت گزارش‌گیری
            $table->index(['user_id', 'action_group', 'created_at']); 
            $table->index(['action', 'created_at']);         
            $table->index(['model_type', 'model_id']);       
            $table->index('severity');                       
            $table->index('device_type');                    
            $table->index('ip_address');                     
        });
    }

    public function down(): void {
        Schema::dropIfExists('activity_logs');
    }
};