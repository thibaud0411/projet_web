<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insérer les rôles de base
        $roles = [
            [
                'id_role' => 1,
                'nom_role' => 'administrateur',
                'description' => 'Administrateur du système'
            ],
            [
                'id_role' => 2,
                'nom_role' => 'gerant',
                'description' => 'Gérant du restaurant'
            ],
            [
                'id_role' => 3,
                'nom_role' => 'employe',
                'description' => 'Employé du restaurant'
            ],
            [
                'id_role' => 4,
                'nom_role' => 'etudiant',
                'description' => 'Client étudiant'
            ]
        ];

        foreach ($roles as $role) {
            DB::table('role')->insertOrIgnore($role);
        }
    }
}