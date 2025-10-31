<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categorie; // Importer le modèle

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilise firstOrCreate pour éviter les doublons
        Categorie::firstOrCreate(['nom_categorie' => 'Plats principaux'], ['description' => 'Plats chauds et principaux', 'ordre_affichage' => 1, 'active' => true]);
        Categorie::firstOrCreate(['nom_categorie' => 'Boissons'], ['description' => 'Boissons chaudes et froides', 'ordre_affichage' => 2, 'active' => true]);
        Categorie::firstOrCreate(['nom_categorie' => 'Menu du jour'], ['description' => 'Plat spécial du jour', 'ordre_affichage' => 0, 'active' => true]);


        $this->command->info('CategorieSeeder exécuté (Plats principaux, Boissons, Menu du jour).');
    }
}