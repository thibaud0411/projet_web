<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users with different roles
        $users = [
            [
                'nom' => 'Admin',
                'prenom' => 'User',
                'email' => 'admin@teste.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '0123456789',
                'localisation' => 'Admin Location',
                'points_fidelite' => 0,
                'code_parrainage' => 'ADMIN1234',
                'id_parrain' => null,
                'id_role' => 1, // Administrateur
                'statut_compte' => true,
                'date_inscription' => now(),
                'date_modification' => now()
            ],
            [
                'nom' => 'Gérant',
                'prenom' => 'User',
                'email' => 'gerant@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '0123456788',
                'localisation' => 'Gérant Location',
                'points_fidelite' => 0,
                'code_parrainage' => 'GERANT123',
                'id_parrain' => null,
                'id_role' => 2, // Gérant
                'statut_compte' => true,
             
                'date_inscription' => now(),
                'date_modification' => now()
            ],
            [
                'nom' => 'Employé',
                'prenom' => 'User',
                'email' => 'employe@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '0123456787',
                'localisation' => 'Employé Location',
                'points_fidelite' => 0,
                'code_parrainage' => 'EMPLOYE123',
                'id_parrain' => null,
                'id_role' => 3, // Employé
                'statut_compte' => true,
                
                'date_inscription' => now(),
                'date_modification' => now()
            ],
            [
                'nom' => 'Étudiant',
                'prenom' => 'User',
                'email' => 'etudiant@test.com',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '0123456786',
                'localisation' => 'Étudiant Location',
                'points_fidelite' => 0,
                'code_parrainage' => 'ETUDIANT123',
                'id_parrain' => null,
                'id_role' => 4, // Étudiant
                'statut_compte' => true,
            
                'date_inscription' => now(),
                'date_modification' => now()
            ]
        ];

        foreach ($users as $user) {
            Utilisateur::create($user);
        }
    }
}