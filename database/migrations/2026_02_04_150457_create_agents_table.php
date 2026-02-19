<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();                                    // شناسه نماینده
            $table->foreignId('user_id')->unique()->constrained('users'); // کاربر نماینده
            $table->string('agent_code', 20)->unique();      // کد یکتای نمایندگی
            $table->string('store_name')->nullable();        // نام فروشگاه
            $table->string('area', 100)->nullable();         // منطقه تحت پوشش
            $table->unsignedInteger('max_clients')->nullable(); // حداکثر تعداد مشتری
            $table->decimal('commission_rate', 5, 2)->nullable(); // درصد کمیسیون
            $table->boolean('is_active')->default(true);     // فعال بودن نماینده
            $table->timestamp('verified_at')->nullable();    // زمان تأیید نماینده
            $table->timestamps();                            // زمان ایجاد و بروزرسانی
            $table->softDeletes();                           // حذف نرم
            
            $table->index(['agent_code', 'is_active']);      // ایندکس برای جستجو
            $table->index('store_name');                     // ایندکس نام فروشگاه
            $table->index('area');                           // ایندکس برای فیلتر منطقه
            $table->index('verified_at');                    // ایندکس برای نمایندگان تأیید شده
        });

        // اضافه کردن کلید خارجی به جدول users (چون وابستگی دوری وجود دارد)
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('agent_id')
                  ->references('id')
                  ->on('agents')
                  ->nullOnDelete();
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
        });
        Schema::dropIfExists('agents');
    }
};