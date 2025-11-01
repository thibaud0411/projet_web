<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participation', function (Blueprint $table) {
            $table->id('id_participation');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur')->onDelete('cascade');
            $table->foreignId('id_evenement')->constrained('evenement', 'id_evenement')->onDelete('cascade');
            $table->timestamp('date_participation')->useCurrent();
            $table->integer('points_gagnes')->default(0);
            $table->integer('score')->nullable();
            $table->boolean('a_gagne')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participation');
    }
};