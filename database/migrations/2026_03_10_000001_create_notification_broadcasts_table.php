<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->string('target_type'); // all, club, manual
            $table->unsignedBigInteger('target_id')->nullable(); 
            $table->json('recipient_ids')->nullable(); // ذخیره لیست ID کاربران در انتخاب دستی
            $table->json('channels'); 
            $table->integer('recipient_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_broadcasts');
    }
};