<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ligne_commande', function (Blueprint $table) {
            $table->id('id_ligne');
            $table->foreignId('id_commande')->constrained('commande', 'id_commande')->onDelete('cascade');
            $table->foreignId('id_article')->constrained('article', 'id_article')->onDelete('restrict');
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 12, 2);
            $table->decimal('sous_total', 14, 2)->default(0);
            $table->text('commentaire_article')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ligne_commande');
    }
};