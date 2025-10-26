<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistique', function (Blueprint $table) {
            $table->id('id_statistique');
            $table->foreignId('id_utilisateur')->unique()->constrained('utilisateur', 'id_utilisateur')->onDelete('cascade');
            $table->integer('total_commandes')->default(0);
            $table->decimal('total_depense', 14, 2)->default(0);
            $table->integer('total_points_gagnes')->default(0);
            $table->integer('total_points_utilises')->default(0);
            $table->integer('total_parrainages')->default(0);
            $table->decimal('note_moyenne', 5, 2)->nullable();
            $table->timestamp('derniere_mise_a_jour')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistique');
    }
};