<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash; // Pour hasher le mot de passe

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        $roleEtudiant = Role::where('nom_role', 'Etudiant')->first();

        if (!$roleEtudiant) {
            $this->command->error("Le rôle 'Etudiant' n'existe pas. Lancez RoleSeeder d'abord.");
            return;
        }

        Utilisateur::create([
            'nom' => 'Dupont',
            'prenom' => 'Alice',
            'email' => 'alice.dupont@etu.test',
            'mot_de_passe' => Hash::make('password123'), // Utilise un mot de passe sécurisé
            'telephone' => '123456789',
            'id_role' => $roleEtudiant->id_role,
        ]);

        Utilisateur::create([
            'nom' => 'Martin',
            'prenom' => 'Bob',
            'email' => 'bob.martin@etu.test',
            'mot_de_passe' => Hash::make('password123'),
            'telephone' => '987654321',
            'id_role' => $roleEtudiant->id_role,
        ]);

        $this->command->info('UtilisateurSeeder exécuté.');
    }
}