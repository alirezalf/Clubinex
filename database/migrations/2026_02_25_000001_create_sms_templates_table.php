<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content')->nullable(); // The message pattern (e.g., "Hello {name}")
            $table->string('provider_template_id')->nullable(); // The ID from the provider (e.g., "100234")
            $table->timestamps();
        });

        Schema::table('notification_templates', function (Blueprint $table) {
            // Drop the string column added previously if it exists
            if (Schema::hasColumn('notification_templates', 'sms_template_id')) {
                $table->dropColumn('sms_template_id');
            }
        });

        Schema::table('notification_templates', function (Blueprint $table) {
            // Add the foreign key column
            $table->foreignId('sms_template_id')->nullable()->constrained('sms_templates')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('notification_templates', function (Blueprint $table) {
            $table->dropForeign(['sms_template_id']);
            $table->dropColumn('sms_template_id');
        });

        Schema::dropIfExists('sms_templates');
    }
};
