<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiement', function (Blueprint $table) {
            $table->id('id_paiement');
            $table->foreignId('id_commande')->unique()->constrained('commande', 'id_commande')->onDelete('cascade');
            $table->decimal('montant', 12, 2);
            $table->string('methode_paiement')->nullable(); // 'carte','mobile_money',...
            $table->timestamp('date_paiement')->useCurrent();
            $table->string('statut_paiement')->nullable(); // 'en_attente','valide',...
            $table->string('transaction_id')->unique()->nullable();
            $table->integer('points_utilises')->default(0);
            $table->decimal('montant_points', 12, 2)->default(0);
            $table->decimal('montant_especes', 12, 2)->default(0);
            $table->string('reference_paiement')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiement');
    }
};