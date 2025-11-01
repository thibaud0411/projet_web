<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        if (!Utilisateur::where('email', 'admin@monmiammiam.com')->exists()) {
            Utilisateur::create([
                'nom' => 'Admin',
                'prenom' => 'System',
                'email' => 'admin@monmiammiam.com',
                'mot_de_passe' => Hash::make('admin123'), // Change this to a secure password in production
                'id_role' => '1',
                'telephone' => '0600000000',
                'date_inscription' => now(),
                'date_modification' => now(),
                'statut_compte' => true,
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: admin@monmiammiam.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
