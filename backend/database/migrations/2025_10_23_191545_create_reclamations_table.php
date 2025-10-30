<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reclamation', function (Blueprint $table) {
            $table->id('id_reclamation');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur')->onDelete('restrict');
            $table->foreignId('id_commande')->nullable()->constrained('commande', 'id_commande')->onDelete('set null');
            $table->foreignId('id_employe_traitement')->nullable()->constrained('employe', 'id_employe')->onDelete('set null');
            $table->text('description');
            $table->string('statut')->nullable();
            $table->timestamp('date_reclamation')->useCurrent();
            $table->timestamp('date_traitement')->nullable();
            $table->text('reponse')->nullable();
            $table->string('priorite')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('reclamation'); }
};