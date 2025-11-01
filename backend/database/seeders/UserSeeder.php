<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed test User accounts for Sanctum authentication.
     * These are separate from Utilisateur and are used for API auth.
     */
    public function run(): void
    {
        // Create test student account - always logged in
        User::firstOrCreate(
            ['email' => 'student@test.com'],
            [
                'name' => 'Test Student',
                'password' => Hash::make('password'),
                'points_balance' => 50,
            ]
        );

        // Create additional test accounts
        User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('password'),
                'points_balance' => 0,
            ]
        );

        User::firstOrCreate(
            ['email' => 'employee@test.com'],
            [
                'name' => 'Test Employee',
                'password' => Hash::make('password'),
                'points_balance' => 0,
            ]
        );

        $this->command->info('✅ UserSeeder exécuté - Comptes de test créés.');
        $this->command->info('📧 Test Student: student@test.com / password');
    }
}
