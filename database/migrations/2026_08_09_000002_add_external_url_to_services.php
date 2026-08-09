<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->string('externalUrl')->nullable()->default(null)->after('description');
            $table->string('externalNote')->nullable()->default(null)->after('externalUrl');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->dropColumn(['externalUrl', 'externalNote']);
        });
    }
};
