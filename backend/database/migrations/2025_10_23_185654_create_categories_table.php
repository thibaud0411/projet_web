<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // N'oubliez pas d'importer DB

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorie', function (Blueprint $table) {
            $table->id('id_categorie');
            $table->string('nom_categorie')->unique();
            $table->text('description')->nullable();
            $table->integer('ordre_affichage')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamp('date_creation')->useCurrent();
        });

        // Insérer les données initiales
        DB::table('categorie')->insert([
            ['nom_categorie' => 'Plats principaux', 'description' => 'Plats chauds et principaux', 'ordre_affichage' => 1],
            ['nom_categorie' => 'Boissons', 'description' => 'Boissons chaudes et froides', 'ordre_affichage' => 2],
            ['nom_categorie' => 'Desserts', 'description' => 'Desserts et sucreries', 'ordre_affichage' => 3],
            ['nom_categorie' => 'Entrées', 'description' => 'Entrées et apéritifs', 'ordre_affichage' => 4],
            ['nom_categorie' => 'Menu du jour', 'description' => 'Plat spécial du jour', 'ordre_affichage' => 0],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('categorie');
    }
};