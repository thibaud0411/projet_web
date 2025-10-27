<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateur', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('mot_de_passe');
            $table->string('telephone');
            $table->text('localisation')->nullable();
            $table->integer('points_fidelite')->default(0);
            $table->string('code_parrainage')->unique()->nullable();
            
            // Clé étrangère pour le parrain (sur elle-même)
            $table->foreignId('id_parrain')->nullable()->constrained('utilisateur', 'id_utilisateur')->onDelete('set null');
            
            // Clé étrangère pour le rôle (dépend de la table 'role')
            $table->foreignId('id_role')->default(1)->constrained('role', 'id_role');
            
            $table->timestamp('date_inscription')->useCurrent();
            $table->boolean('statut_compte')->default(true);
            $table->timestamp('derniere_connexion')->nullable();
            $table->timestamp('date_modification')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('utilisateur'); }
};