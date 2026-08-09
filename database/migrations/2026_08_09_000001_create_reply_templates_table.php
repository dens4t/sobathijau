<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reply_templates', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('label');
            $table->string('status');
            $table->text('text');
            $table->integer('sort_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reply_templates');
    }
};
