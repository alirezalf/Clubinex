<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);                    // عنوان جایزه
            $table->text('description')->nullable();         // توضیحات
            $table->string('image')->nullable();             // تصویر جایزه
            $table->integer('points_cost');                  // هزینه امتیاز
            $table->enum('type', ['digital', 'physical', 'charge', 'discount_code']); // نوع جایزه
            $table->text('delivery_instructions')->nullable(); // دستورالعمل دریافت/ارسال
            $table->integer('stock')->default(0);            // موجودی انبار
            $table->integer('limit_per_user')->nullable();   // محدودیت دریافت برای هر کاربر
            $table->boolean('is_active')->default(true);     // فعال بودن
            $table->foreignId('required_club_id')->nullable()->constrained('clubs'); // سطح باشگاه مورد نیاز
            $table->timestamp('valid_until')->nullable();    // تاریخ اعتبار جایزه
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'points_cost']);
        });

        // جدول درخواست‌های دریافت جایزه
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            
            // ادغام شده: nullable برای جوایز گردونه
            $table->foreignId('reward_id')->nullable()->constrained('rewards');
            
            // اصلاح شده: حذف قید constrained در اینجا چون جدول lucky_wheel_spins هنوز ساخته نشده است.
            // این ستون به صورت unsignedBigInteger ساخته می‌شود و قید آن در مایگریشن lucky_wheels اضافه خواهد شد.
            $table->unsignedBigInteger('lucky_wheel_spin_id')->nullable();
            
            $table->integer('points_spent');                 // امتیاز خرج شده در لحظه ثبت
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending');
            
            // ادغام شده: ادمین تغییر دهنده وضعیت
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->text('admin_note')->nullable();          // یادداشت ادمین
            $table->json('delivery_info')->nullable();       // اطلاعات ارسال (آدرس و ...)
            $table->string('tracking_code')->nullable();     // کد رهگیری پستی یا کد دیجیتال
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('reward_redemptions');
        Schema::dropIfExists('rewards');
    }
};