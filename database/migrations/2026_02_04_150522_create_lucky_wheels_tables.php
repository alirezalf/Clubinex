<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // جدول اصلی گردونه (ممکن است چندین گردونه مناسبتی داشته باشیم)
        Schema::create('lucky_wheels', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('cost_per_spin')->default(0);    // هزینه هر بار چرخش (امتیاز)
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->foreignId('required_club_id')->nullable()->constrained('clubs');
            $table->timestamps();
        });

        // آیتم‌های روی گردونه (اسلایس‌ها)
        Schema::create('lucky_wheel_prizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lucky_wheel_id')->constrained('lucky_wheels')->onDelete('cascade');
            $table->string('title');                         // عنوان آیتم (مثلا: 100 امتیاز)
            $table->string('icon')->nullable();              // آیکون یا تصویر آیتم
            $table->string('color')->default('#ffffff');     // رنگ پس‌زمینه اسلایس
            $table->enum('type', ['points', 'item', 'empty', 'retry']); // نوع جایزه
            $table->integer('value')->default(0);            // مقدار (مثلا تعداد امتیاز)
            $table->integer('probability')->default(0);      // شانس برنده شدن (وزن)
            $table->integer('stock')->nullable();            // محدودیت تعداد موجودی این جایزه
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // لاگ چرخش‌ها
        Schema::create('lucky_wheel_spins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('lucky_wheel_id')->constrained('lucky_wheels');
            $table->foreignId('prize_id')->nullable()->constrained('lucky_wheel_prizes');
            $table->integer('cost_paid')->default(0);        // هزینه پرداخت شده
            $table->boolean('is_win')->default(false);       // آیا برنده شده؟ (پوچ نبوده)
            $table->timestamps();
        });

        // اضافه کردن کلید خارجی به جدول reward_redemptions
        // این کار اینجا انجام می‌شود چون در این لحظه جدول lucky_wheel_spins وجود دارد
        Schema::table('reward_redemptions', function (Blueprint $table) {
            $table->foreign('lucky_wheel_spin_id')
                  ->references('id')
                  ->on('lucky_wheel_spins')
                  ->nullOnDelete();
        });
    }

    public function down(): void {
        // حذف کلید خارجی قبل از حذف جدول‌ها
        if (Schema::hasTable('reward_redemptions')) {
            Schema::table('reward_redemptions', function (Blueprint $table) {
                $table->dropForeign(['lucky_wheel_spin_id']);
            });
        }

        Schema::dropIfExists('lucky_wheel_spins');
        Schema::dropIfExists('lucky_wheel_prizes');
        Schema::dropIfExists('lucky_wheels');
    }
};