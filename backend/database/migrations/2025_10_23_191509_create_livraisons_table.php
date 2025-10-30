<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraison', function (Blueprint $table) {
            $table->id('id_livraison');
            $table->foreignId('id_commande')->unique()->constrained('commande', 'id_commande')->onDelete('cascade');
            $table->text('adresse_livraison');
            $table->timestamp('heure_livraison')->nullable();
            $table->string('statut_livraison')->nullable(); // 'en_preparation','en_cours',...
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('instructions_livraison')->nullable();
            $table->integer('id_livreur')->nullable(); // On ne fait pas de clé étrangère ici pour l'instant
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraison');
    }
};