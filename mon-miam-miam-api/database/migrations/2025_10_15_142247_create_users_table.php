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
        
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 150)->unique();
            $table->string('telephone', 20);
            $table->enum('role', ['etudiant', 'employe', 'gerant', 'administrateur'])->default('etudiant');
            $table->enum('statut_compte', ['actif', 'inactif', 'suspendu'])->default('actif');
            $table->integer('points_fidelite')->default(0);
            $table->string('code_parrainage', 20)->unique()->nullable();
            $table->uuid('id_parrain')->nullable();
            $table->text('localisation')->nullable();
            $table->boolean('consentement_cookies')->default(false);
            $table->timestampTz('date_consentement_cookies')->nullable();
            $table->timestampTz('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestampsTz();
            
            // Foreign key
            $table->foreign('id_parrain')->references('id')->on('users')->onDelete('set null');
        });
        
        // Add indexes
        DB::statement('CREATE INDEX idx_users_email ON users(email)');
        DB::statement('CREATE INDEX idx_users_code_parrainage ON users(code_parrainage)');
        DB::statement('CREATE INDEX idx_users_role ON users(role)');
        DB::statement('CREATE INDEX idx_users_id_parrain ON users(id_parrain)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
