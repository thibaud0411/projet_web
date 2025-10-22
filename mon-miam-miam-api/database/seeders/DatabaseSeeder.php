<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin account
        User::create([
            'nom' => 'Admin',
            'prenom' => 'Super',
            'email' => 'admin@monmiammiam.com',
            'telephone' => '+229 90000001',
            'password' => bcrypt('Admin123!'),
            'role' => 'administrateur',
            'statut_compte' => 'actif',
            'email_verified_at' => now(),
        ]);

        // Create default gerant account
        User::create([
            'nom' => 'Durand',
            'prenom' => 'Jean',
            'email' => 'gerant@monmiammiam.com',
            'telephone' => '+229 90000002',
            'password' => bcrypt('Gerant123!'),
            'role' => 'gerant',
            'statut_compte' => 'actif',
            'email_verified_at' => now(),
        ]);
    }
}
