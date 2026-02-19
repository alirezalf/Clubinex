<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();                                    // شناسه سوال
            $table->foreignId('survey_id')->constrained('surveys')->onDelete('cascade'); // نظرسنجی والد
            $table->text('question');                        // متن سوال
            $table->enum('type', ['multiple_choice', 'text', 'number', 'rating']); // نوع سوال
            $table->json('options')->nullable();             // گزینه‌ها (برای چندگزینه‌ای - JSON)
            $table->json('correct_answer')->nullable();      // پاسخ صحیح (برای مسابقه - JSON)
            $table->unsignedInteger('points')->default(0);   // امتیاز این سوال
            $table->boolean('is_required')->default(false);  // اجباری بودن پاسخ
            $table->unsignedInteger('order');                // ترتیب نمایش در نظرسنجی
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['survey_id', 'order']);           // ایندکس برای مرتب‌سازی
            $table->index('type');                           // ایندکس برای فیلتر نوع
            $table->index('is_required');                    // ایندکس برای سوالات اجباری
        });
    }

    public function down(): void {
        Schema::dropIfExists('survey_questions');
    }
};