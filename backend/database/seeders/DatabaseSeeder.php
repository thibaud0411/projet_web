<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            StaffAndDefaultUserSeeder::class, // <<<--- AJOUTÉ ICI
            UtilisateurSeeder::class,         // (Ceci crée Alice et Bob)
            CategorieSeeder::class,
            ArticleSeeder::class,
            CommandeSeeder::class,
            PaiementSeeder::class,      
            ParrainageSeeder::class,    
            ReclamationSeeder::class,
            TodayDataSeeder::class,    
        ]);
         $this->command->info('Tous les seeders principaux ont été exécutés.');
    }
}