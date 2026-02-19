<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('event_name')->unique(); // مثلا: user_registered, reward_redeemed
            $table->string('title_fa'); // عنوان فارسی برای نمایش به ادمین
            $table->text('variables')->nullable(); // متغیرهای قابل استفاده (مثلا: {name}, {code})
            
            // تنظیمات کانال‌ها
            $table->boolean('sms_active')->default(false);
            $table->text('sms_pattern')->nullable(); // متن یا پترن پیامک
            
            $table->boolean('email_active')->default(false);
            $table->string('email_subject')->nullable();
            $table->text('email_body')->nullable(); // می‌تواند HTML باشد
            
            // ادغام شده: اتصال به تم ایمیل
            $table->foreignId('email_theme_id')->nullable()->constrained('email_themes')->nullOnDelete();
            
            $table->boolean('database_active')->default(true); // نوتیفیکیشن داخلی پنل
            $table->text('database_message')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};