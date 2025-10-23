<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // N'oubliez pas d'importer DB

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role', function (Blueprint $table) {
            $table->id('id_role');
            $table->string('nom_role')->unique();
            $table->text('description')->nullable();
            $table->timestamp('date_creation')->useCurrent();
        });

        // Insérer les données initiales [cite: 36, 40, 41, 128]
        DB::table('role')->insert([
            ['nom_role' => 'Etudiant', 'description' => 'Utilisateur étudiant standard'],
            ['nom_role' => 'Employe', 'description' => 'Employé du restaurant'],
            ['nom_role' => 'Gerant', 'description' => 'Gérant du restaurant'],
            ['nom_role' => 'Administrateur', 'description' => 'Administrateur système'],
        ]);
    }
    public function down(): void { Schema::dropIfExists('role'); }
};