<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // passport, visa, insurance, acceptance_letter
            $table->date('expiration_date')->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->string('file_path')->nullable();
            $table->string('status')->default('pending'); // pending, sent, approved, expired
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
