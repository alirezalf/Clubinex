<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('referral_network', function (Blueprint $table) {
            $table->id();                                    // شناسه معرفی
            $table->foreignId('referrer_id')->constrained('users'); // کاربر معرف
            $table->foreignId('referred_id')->constrained('users')->unique(); // کاربر معرفی‌شده
            $table->unsignedTinyInteger('level')->default(1); // سطح معرفی (1: مستقیم، 2: غیرمستقیم، ...)
            $table->enum('status', ['pending', 'active', 'rejected'])->default('pending'); // وضعیت معرفی
            $table->timestamp('activated_at')->nullable();   // زمان فعال‌شدن (تکمیل ثبت‌نام معرفی‌شده)
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->unique(['referrer_id', 'referred_id']);  // هر معرفی یکتا
            $table->index(['referrer_id', 'level']);         // ایندکس برای تحلیل شبکه
            $table->index(['status', 'activated_at']);       // ایندکس برای فیلتر وضعیت
            $table->index('referred_id');                    // ایندکس برای جستجوی معرفی‌شده
        });
    }

    public function down(): void {
        Schema::dropIfExists('referral_network');
    }
};