<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول گروه اسلایدر
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location_key')->unique();
            $table->string('height_class')->default('h-64');
            $table->string('border_radius')->default('rounded-2xl');
            $table->integer('interval')->default(5000);
            $table->string('effect')->default('fade');
            $table->integer('slides_per_view')->default(1);
            
            // تنظیمات ظاهری
            $table->boolean('loop')->default(true);
            $table->string('direction')->default('ltr'); // ltr, rtl
            $table->string('border_width')->default('0'); // 0, 2, 4, 8...
            $table->string('border_color')->default('#000000');
            $table->integer('gap')->default(0); // pixel val
            $table->string('gap_color')->nullable(); // رنگ فضای خالی بین اسلایدها

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // جدول آیتم‌های اسلایدر
        Schema::create('slides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slider_id')->constrained('sliders')->onDelete('cascade');
            $table->string('image_path')->nullable(); 
            $table->string('bg_color')->nullable(); 
            $table->string('bg_text')->nullable(); // واترمارک
            
            // محتوا
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();
            
            // موقعیت‌دهی
            $table->string('content_position')->default('center-center'); 
            $table->string('btn_relative_pos')->default('below'); 
            $table->string('btn_pos_type')->default('relative'); 
            $table->string('btn_custom_pos')->nullable(); 
            
            // استایل ظاهری
            $table->string('text_color')->default('text-white');
            $table->string('text_size')->default('text-3xl'); 
            $table->string('button_color')->default('#ffffff'); 
            $table->string('button_bg_color')->default('#0284c7'); 
            $table->string('button_size')->default('md'); 
            
            // انیمیشن‌ها
            $table->string('anim_speed')->default('normal'); 
            $table->string('text_anim_in')->default('fade-in-up'); 
            $table->string('text_anim_out')->default('fade-out'); 
            $table->string('btn_anim_in')->default('fade-in-up'); 
            $table->string('btn_anim_out')->default('fade-out'); 
            
            // فیلدهای قدیمی
            $table->string('text_position')->nullable(); 
            $table->string('animation_type')->nullable();

            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slides');
        Schema::dropIfExists('sliders');
    }
};