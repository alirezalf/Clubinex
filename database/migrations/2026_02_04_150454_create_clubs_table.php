<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('clubs', function (Blueprint $table) {
            $table->id();                                    // شناسه باشگاه
            $table->string('name', 100);                     // نام باشگاه (برنزی/نقره‌ای/...)
            $table->string('slug', 100)->unique();           // نامک یکتا
            // ادغام شده: فیلدهای جدید
            $table->boolean('is_tier')->default(false);      // true: سطح اصلی (لول)، false: باشگاه ویژه/اتاق
            $table->string('icon', 100)->nullable();         // آیکون باشگاه
            $table->string('image')->nullable();             // تصویر باشگاه
            $table->unsignedInteger('min_points')->default(0); // حداقل امتیاز برای عضویت
            $table->unsignedInteger('max_points')->nullable(); // حداکثر امتیاز برای ماندن
            $table->integer('joining_cost')->default(0);     // هزینه عضویت به امتیاز
            $table->string('color', 20);                     // رنگ باشگاه
            $table->json('benefits')->nullable();            // مزایای باشگاه (JSON)
            $table->boolean('is_active')->default(true);     // فعال بودن باشگاه
            $table->boolean('upgrade_required')->default(false); // نیاز به تأیید ارتقا
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['is_active', 'min_points']);      // ایندکس برای فیلتر
            $table->index('slug');                           // ایندکس برای جستجو
        });
    }

    public function down(): void {
        Schema::dropIfExists('clubs');
    }
};