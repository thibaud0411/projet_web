<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Enable UUID extension for PostgreSQL
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        
        // Create users table that matches Supabase structure
        DB::statement('
            CREATE TABLE users (
                id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                telephone VARCHAR(20) NOT NULL,
                role VARCHAR(20) CHECK (role IN (\'etudiant\', \'employe\', \'gerant\', \'administrateur\')) DEFAULT \'etudiant\',
                statut_compte VARCHAR(20) CHECK (statut_compte IN (\'actif\', \'inactif\', \'suspendu\')) DEFAULT \'actif\',
                points_fidelite INT DEFAULT 0,
                code_parrainage VARCHAR(20) UNIQUE,
                id_parrain UUID REFERENCES users(id) ON DELETE SET NULL,
                localisation TEXT,
                consentement_cookies BOOLEAN DEFAULT FALSE,
                date_consentement_cookies TIMESTAMPTZ,
                email_verified_at TIMESTAMPTZ,
                remember_token VARCHAR(100),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ');
        
        // Add indexes for performance
        DB::statement('CREATE INDEX idx_users_email ON users(email)');
        DB::statement('CREATE INDEX idx_users_code_parrainage ON users(code_parrainage)');
        DB::statement('CREATE INDEX idx_users_role ON users(role)');
        DB::statement('CREATE INDEX idx_users_id_parrain ON users(id_parrain)');
        
        // Create trigger for updated_at
        DB::statement('
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ');
        
        DB::statement('
            CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
        DB::statement('DROP FUNCTION IF EXISTS update_updated_at_column()');
        Schema::dropIfExists('users');
    }
};
