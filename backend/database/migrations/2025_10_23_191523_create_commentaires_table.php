<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commentaire', function (Blueprint $table) {
            $table->id('id_commentaire');
            $table->foreignId('id_commande')->constrained('commande', 'id_commande')->onDelete('cascade');
            $table->text('contenu');
            $table->integer('note')->nullable(); // 1-5
            $table->timestamp('date_commentaire')->useCurrent();
            $table->boolean('est_visible')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commentaire');
    }
};