<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('mobile', 11)->unique();
            $table->string('otp', 6)->nullable();
            $table->timestamp('otp_verified_at')->nullable();

            $table->string('username', 50)->nullable()->unique();
            $table->string('password')->nullable();
            $table->integer('current_points')->default(0);
            $table->timestamp('password_set_at')->nullable();

            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();

            $table->boolean('profile_completed')->default(false);

            $table->string('first_name', 50)->nullable();
            $table->string('last_name', 50)->nullable();
            $table->string('national_code', 10)->nullable()->unique();
            $table->date('birth_date')->nullable();
            
            // Gender as Enum
            $table->enum('gender', ['male', 'female', 'other'])->nullable(); 

            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('job', 100)->nullable();
            
            // Location as Foreign Keys
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            
            $table->string('postal_code', 10)->nullable();
            $table->text('address')->nullable();

            $table->string('email', 100)->nullable()->unique();
            $table->string('avatar', 255)->nullable();

            $table->foreignId('status_id')->constrained('user_statuses');
            $table->foreignId('club_id')->nullable()->constrained('clubs');
            $table->string('referral_code', 20)->nullable()->unique();
            $table->foreignId('referred_by')->nullable()->constrained('users');
            
            // ادغام شده: فیلد agent_id (کلید خارجی در مایگریشن agents تعریف می‌شود)
            $table->unsignedBigInteger('agent_id')->nullable();

            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            
            // ادغام شده: تنظیمات
            $table->json('theme_preferences')->nullable();
            $table->json('dashboard_preferences')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['mobile', 'deleted_at']);
            $table->index(['status_id', 'club_id']);
            $table->index(['province_id', 'city_id']);
            $table->index('gender');
            
            $table->index(['last_name', 'first_name']);
            $table->index('created_at');
        });

        Schema::create('club_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('club_id')->constrained()->onDelete('cascade');
            $table->timestamp('joined_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            
            $table->unique(['user_id', 'club_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('club_user');
        Schema::dropIfExists('users');
    }
};