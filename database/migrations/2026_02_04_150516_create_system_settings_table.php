<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group', 50);
            $table->string('key', 100);
            $table->longText('value')->nullable(); // Changed from json to longText
            $table->enum('type', ['string', 'number', 'boolean', 'array', 'object']);
            $table->string('label', 200);
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['group', 'key']);
            $table->index(['group', 'is_public']);
            $table->index('type');
            $table->index('is_public');
        });
    }

    public function down(): void {
        Schema::dropIfExists('system_settings');
    }
};