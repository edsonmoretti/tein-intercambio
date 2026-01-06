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
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('exchange_member_id')->nullable()->constrained()->onDelete('cascade');
        });
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('exchange_member_id')->nullable()->constrained()->onDelete('cascade');
        });
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('exchange_member_id')->nullable()->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['exchange_member_id']);
            $table->dropColumn('exchange_member_id');
        });
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign(['exchange_member_id']);
            $table->dropColumn('exchange_member_id');
        });
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['exchange_member_id']);
            $table->dropColumn('exchange_member_id');
        });
    }
};
