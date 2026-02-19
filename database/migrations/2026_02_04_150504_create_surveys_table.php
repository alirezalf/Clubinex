<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();                                    // شناسه نظرسنجی
            $table->string('title', 200);                    // عنوان نظرسنجی
            $table->string('slug', 200)->unique();           // نامک یکتا برای URL
            $table->text('description')->nullable();         // توضیحات کامل نظرسنجی
            $table->enum('type', ['quiz', 'poll', 'form']);  // نوع (مسابقه/نظرسنجی/فرم)
            $table->boolean('is_active')->default(true);     // فعال بودن نظرسنجی
            $table->boolean('is_public')->default(true);     // عمومی بودن (برای همه کاربران)
            $table->timestamp('starts_at')->nullable();      // زمان شروع نظرسنجی
            $table->timestamp('ends_at')->nullable();        // زمان پایان نظرسنجی
            $table->unsignedInteger('max_attempts')->nullable(); // حداکثر دفعات شرکت
            // ادغام شده: مدت زمان آزمون
            $table->integer('duration_minutes')->nullable()->comment('مدت زمان آزمون به دقیقه');
            
            $table->foreignId('required_club_id')->nullable()->constrained('clubs'); // حداقل سطح برای شرکت
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['is_active', 'type']);            // ایندکس برای فیلتر
            $table->index(['starts_at', 'ends_at']);         // ایندکس برای تاریخ‌ها
            $table->index('required_club_id');               // ایندکس برای سطح مورد نیاز
            $table->index('slug');                           // ایندکس برای جستجو
        });
    }

    public function down(): void {
        Schema::dropIfExists('surveys');
    }
};