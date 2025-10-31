<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use App\Models\Employe;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon; // Pour la date d'embauche

class StaffAndDefaultUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Récupérer les rôles
        $roleGerant = Role::where('nom_role', 'Gerant')->first();
        $roleEmploye = Role::where('nom_role', 'Employe')->first();
        $roleEtudiant = Role::where('nom_role', 'Etudiant')->first();

        if (!$roleGerant || !$roleEmploye || !$roleEtudiant) {
            $this->command->error("Les rôles de base (Gerant, Employe, Etudiant) sont manquants.");
            $this->command->error("Veuillez exécuter le RoleSeeder avant celui-ci !");
            return;
        }

        // 2. Créer le compte Gérant
        $gerant = Utilisateur::firstOrCreate(
            ['email' => 'gerant@restaurant.com'],
            [
                'nom' => 'Le',
                'prenom' => 'Gérant',
                'mot_de_passe' => Hash::make('gerant123'),
                'telephone' => '00000001',
                'id_role' => $roleGerant->id_role,
                'statut_compte' => true,
            ]
        );

        // Lier le gérant à la table "employe"
        Employe::firstOrCreate(
            ['id_utilisateur' => $gerant->id_utilisateur],
            [
                'poste' => 'Gérant Principal',
                'date_embauche' => Carbon::now()->subYear(), // Embauché il y a un an
                'est_actif' => true,
            ]
        );

        // 3. Créer le compte Employé
        $employe = Utilisateur::firstOrCreate(
            ['email' => 'employe@restaurant.com'],
            [
                'nom' => 'Staff',
                'prenom' => 'Cuisine',
                'mot_de_passe' => Hash::make('employe123'),
                'telephone' => '00000002',
                'id_role' => $roleEmploye->id_role,
                'statut_compte' => true,
            ]
        );

        // Lier l'employé à la table "employe"
        Employe::firstOrCreate(
            ['id_utilisateur' => $employe->id_utilisateur],
            [
                'poste' => 'Caissier/Cuisinier',
                'date_embauche' => Carbon::now()->subMonths(3), // Embauché il y a 3 mois
                'est_actif' => true,
            ]
        );

        // 4. Créer le compte Utilisateur banale (Etudiant)
        // (Similaire à ce que fait déjà UtilisateurSeeder)
        Utilisateur::firstOrCreate(
            ['email' => 'etudiant.banal@etu.test'],
            [
                'nom' => 'Banal',
                'prenom' => 'Etudiant',
                'mot_de_passe' => Hash::make('password123'),
                'telephone' => '12345678',
                'id_role' => $roleEtudiant->id_role,
                'statut_compte' => true,
            ]
        );
        
        $this->command->info('StaffAndDefaultUserSeeder exécuté (Gérant, Employé, Etudiant banal créés).');
    }
}