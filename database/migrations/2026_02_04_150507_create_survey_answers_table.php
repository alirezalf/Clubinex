<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('survey_answers', function (Blueprint $table) {
            $table->id();                                    // شناسه پاسخ
            $table->foreignId('user_id')->constrained('users'); // کاربر پاسخ‌دهنده
            $table->foreignId('survey_id')->constrained('surveys'); // نظرسنجی مربوطه
            $table->foreignId('survey_question_id')->constrained('survey_questions'); // سوال پاسخ داده شده
            $table->json('answer');                          // پاسخ کاربر (JSON)
            $table->unsignedInteger('score')->nullable();    // نمره کسب شده (برای مسابقه)
            $table->boolean('is_correct')->nullable();       // صحیح/غلط بودن (برای مسابقه)
            $table->string('ip_address', 45);                // آی‌پی کاربر در زمان پاسخ
            $table->timestamp('submitted_at')->useCurrent(); // زمان ثبت پاسخ
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->unique(['user_id', 'survey_id', 'survey_question_id']); // هر کاربر یک بار به هر سوال پاسخ دهد
            $table->index(['survey_id', 'submitted_at']);    // ایندکس برای گزارش‌گیری
            $table->index(['user_id', 'survey_id']);         // ایندکس برای پیگیری کاربر
            $table->index('is_correct');                     // ایندکس برای تحلیل نتایج
            $table->index('score');                          // ایندکس برای تحلیل نمرات
        });
    }

    public function down(): void {
        Schema::dropIfExists('survey_answers');
    }
};