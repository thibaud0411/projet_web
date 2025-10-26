<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UtilisateurSeeder::class,
            CategorieSeeder::class,
            ArticleSeeder::class,
            CommandeSeeder::class,
            PaiementSeeder::class,      // <<<--- AJOUTÉ (après Commande)
            ParrainageSeeder::class,    // <<<--- AJOUTÉ (après Utilisateur)
            ReclamationSeeder::class,
            // Autres seeders...
        ]);
         $this->command->info('Tous les seeders principaux ont été exécutés.');
    }
}