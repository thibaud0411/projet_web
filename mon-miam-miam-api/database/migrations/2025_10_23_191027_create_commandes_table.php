<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande', function (Blueprint $table) {
            $table->id('id_commande');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur')->onDelete('restrict');
            $table->timestamp('date_commande')->useCurrent();
            $table->decimal('montant_total', 12, 2)->default(0);
            $table->integer('points_gagnes')->default(0);
            $table->string('type_service')->nullable();
            $table->timestamp('heure_arrivee')->nullable();
            $table->string('statut')->default('en_attente');
            $table->string('numero_commande')->unique()->nullable();
            $table->timestamp('date_modification')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('commande'); }
};