<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenement', function (Blueprint $table) {
            $table->id('id_evenement');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->timestamp('date_debut');
            $table->timestamp('date_fin');
            $table->string('type_evenement')->nullable(); // 'jeu','promotion',...
            $table->string('image_url')->nullable();
            $table->integer('recompense_points')->default(0);
            $table->integer('nombre_participants_max')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamp('date_creation')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenement');
    }
};