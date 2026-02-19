<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. جدول دسته‌بندی محصولات
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            // ادغام شده: والد دسته‌بندی
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->unsignedBigInteger('wp_id')->nullable()->index(); // شناسه در وردپرس
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. جدول محصولات
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wp_id')->nullable()->index(); // شناسه در وردپرس
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('title');
            $table->string('model_name')->nullable(); // نام مدل
            $table->string('brand')->nullable(); // برند
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->integer('points_value')->default(0); // امتیازی که کاربر با ثبت این محصول می‌گیرد
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. جدول سریال‌های محصول (برای سریال‌های از پیش تعریف شده توسط ادمین/اکسل)
        Schema::create('product_serials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('serial_code')->unique(); // کد یکتای روی محصول
            $table->boolean('is_used')->default(false); // آیا استفاده شده؟
            $table->foreignId('used_by')->nullable()->constrained('users'); // چه کسی استفاده کرده
            $table->timestamp('used_at')->nullable(); // کی استفاده شده
            $table->timestamps();
        });

        // 4. جدول درخواست‌های ثبت محصول توسط کاربر (سناریوی جدید)
        Schema::create('product_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            
            // اطلاعات محصول
            $table->string('product_name');
            $table->string('product_model');
            $table->string('product_brand')->nullable();
            $table->string('serial_code');
            $table->foreignId('category_id')->nullable()->constrained('categories');
            
            // تصاویر
            $table->string('product_image')->nullable();
            $table->string('invoice_image')->nullable(); // تصویر فاکتور
            
            // نقش‌ها (مشتری، فروشنده، معرف)
            $table->enum('customer_type', ['owner', 'other'])->default('owner');
            $table->string('customer_mobile')->nullable();
            
            $table->enum('seller_type', ['none', 'owner', 'other'])->default('none');
            $table->string('seller_mobile')->nullable();
            
            $table->enum('introducer_type', ['none', 'owner', 'other'])->default('none');
            $table->string('introducer_mobile')->nullable();
            
            // وضعیت گارانتی
            $table->enum('warranty_status', ['no_guarantee', 'request_activation', 'already_active'])->default('request_activation');
            
            // وضعیت درخواست
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('users');
            
            $table->timestamps();
        });

        // 5. جدول استاندارد نوتیفیکیشن لاراول
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('product_registrations');
        Schema::dropIfExists('product_serials');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};