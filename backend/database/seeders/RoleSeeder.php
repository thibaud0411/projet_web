<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Important: Importer DB
use App\Models\Role; // Optionnel mais bonne pratique d'utiliser le modèle

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         // Utilise le modèle ou DB::table()
        Role::firstOrCreate(['nom_role' => 'Etudiant'], ['description' => 'Utilisateur étudiant standard']);
        Role::firstOrCreate(['nom_role' => 'Employe'], ['description' => 'Employé du restaurant']);
        Role::firstOrCreate(['nom_role' => 'Gerant'], ['description' => 'Gérant du restaurant']);
        Role::firstOrCreate(['nom_role' => 'Administrateur'], ['description' => 'Administrateur système']);

        /* // Alternative avec DB::table() si le modèle pose problème
        DB::table('role')->insert([
            ['nom_role' => 'Etudiant', 'description' => 'Utilisateur étudiant standard'],
            ['nom_role' => 'Employe', 'description' => 'Employé du restaurant'],
            ['nom_role' => 'Gerant', 'description' => 'Gérant du restaurant'],
            ['nom_role' => 'Administrateur', 'description' => 'Administrateur système'],
        ]);
        */

        $this->command->info('RoleSeeder exécuté.');
    }
}