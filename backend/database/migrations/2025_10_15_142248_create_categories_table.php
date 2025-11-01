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
        // Create categories table that matches Supabase structure
        DB::statement('
            CREATE TABLE categories (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                description TEXT,
                ordre_affichage INT DEFAULT 0,
                est_actif BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ');
        
        // Create trigger for updated_at
        DB::statement('
            CREATE TRIGGER update_categories_updated_at 
            BEFORE UPDATE ON categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ');
        
        // Insert default categories
        DB::statement("
            INSERT INTO categories (nom, description, ordre_affichage) VALUES
            ('Plats principaux', 'Nos délicieux plats principaux', 1),
            ('Accompagnements', 'Pour accompagner vos plats', 2),
            ('Boissons', 'Boissons chaudes et froides', 3),
            ('Desserts', 'Pour terminer en beauté', 4),
            ('Snacks', 'Petites faims et en-cas', 5)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS update_categories_updated_at ON categories');
        Schema::dropIfExists('categories');
    }
};
