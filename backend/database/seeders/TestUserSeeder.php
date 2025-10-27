<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(
            ['nom_role' => 'administrateur'],
            ['description' => 'Administrateur du système']
        );

        $gerantRole = Role::firstOrCreate(
            ['nom_role' => 'gerant'],
            ['description' => 'Gérant du restaurant']
        );

        $clientRole = Role::firstOrCreate(
            ['nom_role' => 'client'],
            ['description' => 'Client du restaurant']
        );

        // Create admin user
        $admin = Utilisateur::firstOrCreate(
            ['email' => 'admin@monmiammiam.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'mot_de_passe' => Hash::make('Admin123!'),
                'telephone' => '0123456789',
                'id_role' => $adminRole->id_role,
                'statut_compte' => true,  // true = active, false = inactive
                'code_parrainage' => 'ADMIN001',
                'points_fidelite' => 0
            ]
        );

        // Create gerant user
        $gerant = Utilisateur::firstOrCreate(
            ['email' => 'gerant@monmiammiam.com'],
            [
                'nom' => 'Gérant',
                'prenom' => 'Restaurant',
                'mot_de_passe' => Hash::make('Gerant123!'),
                'telephone' => '0123456788',
                'id_role' => $gerantRole->id_role,
                'statut_compte' => true,  // true = active, false = inactive
                'code_parrainage' => 'GERANT001',
                'points_fidelite' => 0
            ]
        );

        // Create test user
        $testUser = Utilisateur::firstOrCreate(
            ['email' => 'test@test.com'],
            [
                'nom' => 'Test',
                'prenom' => 'User',
                'mot_de_passe' => Hash::make('password123'),
                'telephone' => '0123456787',
                'id_role' => $adminRole->id_role,  // Make test user an admin
                'statut_compte' => true,  // true = active, false = inactive
                'code_parrainage' => 'TEST001',
                'points_fidelite' => 100
            ]
        );

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('');
        $this->command->info('📧 Admin: admin@monmiammiam.com / Admin123!');
        $this->command->info('📧 Gérant: gerant@monmiammiam.com / Gerant123!');
        $this->command->info('📧 Test: test@test.com / password123');
    }
}
