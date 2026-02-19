<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();                                    // شناسه کمیسیون
            $table->foreignId('referral_network_id')->constrained('referral_network')->onDelete('cascade'); // معرفی مرتبط
            $table->unsignedTinyInteger('level');            // سطح دریافت کمیسیون
            $table->enum('commission_type', ['percentage', 'fixed']); // نوع کمیسیون
            $table->decimal('commission_value', 10, 2);      // مقدار کمیسیون (درصد یا ثابت)
            $table->unsignedInteger('earned_points');        // امتیاز کسب شده توسط معرف
            $table->foreignId('point_rule_id')->constrained('point_rules'); // قانون امتیاز مرتبط
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['referral_network_id', 'level']); // ایندکس برای تحلیل کمیسیون‌ها
            $table->index('commission_type');                // ایندکس برای فیلتر نوع
            $table->index('earned_points');                  // ایندکس برای تحلیل امتیازات
            $table->index('point_rule_id');                  // ایندکس برای پیگیری قوانین
        });
    }

    public function down(): void {
        Schema::dropIfExists('referral_commissions');
    }
};