<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Parrainage;
use App\Models\Utilisateur;
use App\Models\Role;


class ParrainageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleEtudiant = Role::where('nom_role', 'Etudiant')->first();
         if (!$roleEtudiant) return; // Nécessite RoleSeeder

        $etudiants = Utilisateur::where('id_role', $roleEtudiant->id_role)->limit(2)->get();

        if ($etudiants->count() < 2) {
            $this->command->warn("Moins de 2 étudiants trouvés. Impossible de créer un parrainage.");
            return;
        }

        $parrain = $etudiants->get(0);
        $filleul = $etudiants->get(1);

        // Crée un parrainage (simule qu'il a eu lieu aujourd'hui)
        Parrainage::create([
            'id_parrain' => $parrain->id_utilisateur,
            'id_filleul' => $filleul->id_utilisateur,
            'date_parrainage' => now()->subHours(3), // Parrainage aujourd'hui
            'recompense_attribuee' => true, // Supposons que la récompense est donnée
            'points_gagnes' => 50, // Points par défaut
            'date_recompense' => now()->subHours(2),
        ]);

         // Optionnel: crée un autre parrainage plus ancien
         // (Tu auras besoin d'au moins 3 étudiants pour cela)
         /*
         $etudiant3 = Utilisateur::where('id_role', $roleEtudiant->id_role)->skip(2)->first();
         if ($etudiant3) {
             Parrainage::create([
                 'id_parrain' => $parrain->id_utilisateur,
                 'id_filleul' => $etudiant3->id_utilisateur,
                 'date_parrainage' => now()->subDays(5), // Ancien parrainage
                 'recompense_attribuee' => true,
                 'points_gagnes' => 50,
                 'date_recompense' => now()->subDays(4),
             ]);
         }
         */

        $this->command->info('ParrainageSeeder exécuté.');
    }
}