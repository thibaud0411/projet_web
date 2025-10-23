<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parrainage', function (Blueprint $table) {
            $table->id('id_parrainage');
            $table->foreignId('id_parrain')->constrained('utilisateur', 'id_utilisateur')->onDelete('cascade');
            $table->foreignId('id_filleul')->constrained('utilisateur', 'id_utilisateur')->onDelete('cascade');
            $table->timestamp('date_parrainage')->useCurrent();
            $table->boolean('recompense_attribuee')->default(false);
            $table->integer('points_gagnes')->default(50);
            $table->timestamp('date_recompense')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parrainage');
    }
};