<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('icon')->default('');
            $table->text('description')->default('');
            $table->string('category')->default('');
            $table->json('fields')->nullable();
            $table->boolean('isCustom')->default(false);
        });

        Schema::create('submissions', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('serviceId');
            $table->string('serviceName');
            $table->string('submittedAt');
            $table->string('status');
            $table->string('applicantName');
            $table->json('formData')->nullable();
            $table->json('timeline')->nullable();
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('submissionId');
            $table->string('applicantName');
            $table->string('serviceName');
            $table->string('newStatus');
            $table->text('message');
            $table->string('timestamp');
            $table->boolean('isRead')->default(false);
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->text('action');
            $table->string('timestamp');
            $table->string('iconType')->default('info');
        });

        Schema::create('locations', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('category');
            $table->float('lat');
            $table->float('lng');
            $table->text('address')->default('');
            $table->text('description')->default('');
            $table->string('iconName')->default('');
            $table->string('color')->default('');
            $table->string('createdAt')->default('');
            $table->string('updatedAt')->default('');
        });

        Schema::create('categories', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->default('');
            $table->string('shortDesc')->default('');
            $table->string('iconName')->default('');
            $table->string('color')->default('');
            $table->string('markerColor')->default('');
            $table->integer('order')->default(0);
            $table->string('createdAt')->default('');
            $table->string('updatedAt')->default('');
        });

        Schema::create('network_links', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('url');
            $table->string('description')->default('');
            $table->integer('sortOrder')->default(0);
            $table->boolean('isActive')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('network_links');
    }
};
