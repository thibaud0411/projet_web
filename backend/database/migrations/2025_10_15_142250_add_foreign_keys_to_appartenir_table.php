<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appartenir', function (Blueprint $table) {
            $table->foreign(['document_id'], 'fk_document')->references(['id'])->on('document')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign(['user_id'], 'fk_user')->references(['id'])->on('user')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appartenir', function (Blueprint $table) {
            $table->dropForeign('fk_document');
            $table->dropForeign('fk_user');
        });
    }
};
