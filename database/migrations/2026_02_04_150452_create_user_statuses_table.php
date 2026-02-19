<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_statuses', function (Blueprint $table) {
            $table->id();                                    // شناسه وضعیت
            $table->string('name', 50);                      // نام وضعیت (فارسی)
            $table->string('slug', 50)->unique();            // نامک یکتا (انگلیسی)
            $table->string('color', 20);                     // رنگ نمایش در داشبورد
            $table->boolean('is_active')->default(true);     // فعال بودن وضعیت
            $table->integer('order');                        // ترتیب نمایش
            $table->text('description')->nullable();         // توضیحات وضعیت
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['is_active', 'order']);           // ایندکس برای فیلتر
            $table->index('slug');                           // ایندکس برای جستجو
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_statuses');
    }
};