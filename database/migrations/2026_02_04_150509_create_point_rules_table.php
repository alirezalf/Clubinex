<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();                                    // شناسه قانون امتیاز
            $table->integer('points_required')->default(0);  // حداقل امتیازی که کاربر باید داشته باشد تا بتواند این جایزه را دریافت کند
            $table->integer('stock')->default(0);            // تعداد موجودی جایزه، یعنی چند بار می‌توان این جایزه را خریداری کرد
            $table->string('action_code', 100)->unique();    // کد یکتای عمل (برای برنامه‌نویسی)
            $table->string('title', 200);                    // عنوان قانون (برای نمایش)
            $table->text('description')->nullable();         // توضیحات کامل قانون
            $table->integer('points');                       // مقدار امتیاز (مثبت/منفی)
            $table->enum('type', ['one_time', 'repeatable', 'conditional']); // نوع قانون
            $table->json('conditions')->nullable();          // شرایط اجرا (JSON)
            $table->unsignedInteger('max_per_user')->nullable(); // حداکثر دفعات برای هر کاربر
            $table->boolean('is_active')->default(true);     // فعال بودن قانون
            $table->timestamp('valid_from')->nullable();     // اعتبار از تاریخ
            $table->timestamp('valid_to')->nullable();       // اعتبار تا تاریخ
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم

            $table->index(['is_active', 'action_code']);     // ایندکس برای فیلتر قوانین فعال
            $table->index(['valid_from', 'valid_to']);       // ایندکس برای تاریخ اعتبار
            $table->index('type');                           // ایندکس برای فیلتر نوع
            $table->index('points');                         // ایندکس برای تحلیل امتیازات
        });
    }

    public function down(): void {
        Schema::dropIfExists('point_rules');
    }
};