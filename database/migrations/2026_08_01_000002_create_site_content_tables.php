<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carousel_slides', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('tag');
            $table->string('title');
            $table->string('subtitle');
            $table->string('color_bg');
            $table->string('icon');
            $table->string('metric');
            $table->string('metric_label');
            $table->json('bullet_points')->nullable();
            $table->integer('sort_order')->default(0);
        });

        Schema::create('site_metrics', function (Blueprint $table): void {
            $table->string('key')->primary();
            $table->string('value');
            $table->string('label');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('api_token', 80)->nullable()->default(null)->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('api_token');
        });
        Schema::dropIfExists('site_metrics');
        Schema::dropIfExists('carousel_slides');
    }
};
