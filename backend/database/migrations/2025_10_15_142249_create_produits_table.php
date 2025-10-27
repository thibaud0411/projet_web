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
        // Create produits table that matches Supabase structure
        DB::statement('
            CREATE TABLE produits (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                categorie_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
                nom VARCHAR(150) NOT NULL,
                description TEXT,
                prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
                prix_promotionnel DECIMAL(10,2) CHECK (prix_promotionnel >= 0),
                reference VARCHAR(50) UNIQUE,
                stock_disponible INT DEFAULT 0,
                stock_alerte INT DEFAULT 0,
                est_actif BOOLEAN DEFAULT TRUE,
                est_mis_en_avant BOOLEAN DEFAULT FALSE,
                ingredients TEXT,
                allergenes TEXT,
                temps_preparation INT CHECK (temps_preparation > 0),
                image_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ');
        
        // Add indexes for performance
        DB::statement('CREATE INDEX idx_produits_categorie ON produits(categorie_id)');
        DB::statement('CREATE INDEX idx_produits_actif ON produits(est_actif)');
        DB::statement('CREATE INDEX idx_produits_mis_en_avant ON produits(est_mis_en_avant)');
        DB::statement('CREATE INDEX idx_produits_nom ON produits(nom)');
        DB::statement('CREATE INDEX idx_produits_reference ON produits(reference)');
        
        // Create trigger for updated_at
        DB::statement('
            CREATE TRIGGER update_produits_updated_at 
            BEFORE UPDATE ON produits
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS update_produits_updated_at ON produits');
        Schema::dropIfExists('produits');
    }
};
