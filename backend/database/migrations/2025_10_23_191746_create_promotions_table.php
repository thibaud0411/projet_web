<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion', function (Blueprint $table) {
            $table->id('id_promotion');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->decimal('reduction', 5, 2)->nullable(); // Pourcentage
            $table->decimal('montant_reduction', 12, 2)->nullable(); // Montant fixe
            $table->timestamp('date_debut');
            $table->timestamp('date_fin');
            $table->string('image_url')->nullable();
            $table->boolean('active')->default(true);
            $table->string('code_promo')->unique()->nullable();
            $table->integer('nombre_utilisations')->default(0);
            $table->integer('limite_utilisations')->nullable();
            $table->timestamp('date_creation')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion');
    }
};