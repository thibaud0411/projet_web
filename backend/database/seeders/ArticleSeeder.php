<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Article; // Importer le modèle Article
use App\Models\Categorie; // Importer Categorie pour lier les articles

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les ID des catégories nécessaires
        $catPlats = Categorie::where('nom_categorie', 'Plats principaux')->first();
        $catBoissons = Categorie::where('nom_categorie', 'Boissons')->first();

        // Vérifier que les catégories nécessaires existent
        if (!$catPlats || !$catBoissons) {
            $this->command->error('Les catégories de base (Plats principaux, Boissons) sont manquantes. Lancez CategorieSeeder d\'abord.');
            return;
        }

        // --- Créer les Plats Principaux ---

        Article::firstOrCreate(
            ['nom' => 'Ndolè Royal'],
            [
                'description' => 'Plat traditionnel camerounais aux arachides et légumes.',
                'prix' => 3500,
                'id_categorie' => $catPlats->id_categorie,
                'disponible' => true,
                'stock_disponible' => 50,
            ]
        );

        Article::firstOrCreate(
            ['nom' => 'Poulet DG'],
            [
                'description' => 'Poulet sauté aux légumes et plantains frits.',
                'prix' => 2800, // Prix cohérent avec CommandeSeeder
                'id_categorie' => $catPlats->id_categorie,
                'disponible' => true,
                'stock_disponible' => 40,
            ]
        );

        // --- CORRECTION APPLIQUÉE ICI ---
        Article::firstOrCreate(
            ['nom' => 'Boulettes de Boeuf'], // <<< Nom corrigé ici
            [
                'description' => 'Boulettes de viande de boeuf en sauce. Complément : riz ou frites de plantains.', // Description correcte
                'prix' => 1800, // Prix correct
                'id_categorie' => $catPlats->id_categorie,
                'disponible' => true,
                'stock_disponible' => 35, // Stock correct
            ]
        );
        // --- FIN CORRECTION ---

         Article::firstOrCreate(
            ['nom' => 'Poulet Rôti'],
            [
                'description' => 'Morceaux de poulet rôti. Complément : riz ou frites de plantains.', // Description corrigée (n'était pas Poulet DG)
                'prix' => 2500, // Prix cohérent
                'id_categorie' => $catPlats->id_categorie,
                'disponible' => true,
                'stock_disponible' => 40,
            ]
        );

        // Ajout des autres plats que tu avais mentionnés
         Article::firstOrCreate(['nom' => 'Okok Sucré'],[ 'description' => 'Feuilles d\'okok préparées avec du sucre. Complément : manioc ou bâtons de manioc.', 'prix' => 2000, 'id_categorie' => $catPlats->id_categorie, 'disponible' => true, 'stock_disponible' => 30]);
         Article::firstOrCreate(['nom' => 'Okok Salé'],[ 'description' => 'Feuilles d\'okok préparées salées. Complément : manioc ou bâtons de manioc.', 'prix' => 2000, 'id_categorie' => $catPlats->id_categorie, 'disponible' => true, 'stock_disponible' => 30]);
         Article::firstOrCreate(['nom' => 'Poulet Pané (2 morceaux)'],[ 'description' => 'Deux morceaux de poulet pané. Complément : frites de pommes ou frites de plantains.', 'prix' => 2200, 'id_categorie' => $catPlats->id_categorie, 'disponible' => true, 'stock_disponible' => 20]);
         Article::firstOrCreate(['nom' => 'Poulet Pané (3 morceaux)'],[ 'description' => 'Trois morceaux de poulet pané. Complément : frites de pommes ou frites de plantains.', 'prix' => 3000, 'id_categorie' => $catPlats->id_categorie, 'disponible' => true, 'stock_disponible' => 15]);
         Article::firstOrCreate(['nom' => 'Eru'],[ 'description' => 'Plat à base de feuilles de Gnetum africanum. Complément : water fufu ou garri.', 'prix' => 2500, 'id_categorie' => $catPlats->id_categorie, 'disponible' => true, 'stock_disponible' => 28]);


        // --- Créer les Boissons ---
         Article::firstOrCreate(
            ['nom' => 'Jus de Bissap'],
            [
                'description' => 'Jus d\'hibiscus rafraîchissant fait maison.', // Description correcte
                'prix' => 500, // Prix cohérent
                'id_categorie' => $catBoissons->id_categorie,
                'disponible' => true,
                'stock_disponible' => 100,
            ]
        );
        Article::firstOrCreate(
            ['nom' => 'Malta'],
            [
                'description' => 'Boisson maltée sans alcool.', // Description correcte
                'prix' => 700, // Prix cohérent
                'id_categorie' => $catBoissons->id_categorie,
                'disponible' => true,
                'stock_disponible' => 80, // Stock cohérent
            ]
        );
        Article::firstOrCreate(
            ['nom' => 'Coca-Cola'],
            [
                'description' => 'Boisson gazeuse sucrée.', // Description correcte
                'prix' => 600, // Prix cohérent
                'id_categorie' => $catBoissons->id_categorie,
                'disponible' => true,
                'stock_disponible' => 150, // Stock cohérent
            ]
        );
        // Ajout des autres boissons que tu avais mentionnées
        Article::firstOrCreate(['nom' => 'Fanta (Orange)'],[ 'description' => 'Boisson gazeuse à l\'orange.', 'prix' => 600, 'id_categorie' => $catBoissons->id_categorie, 'disponible' => true, 'stock_disponible' => 120]);
        Article::firstOrCreate(['nom' => 'Planète Pomme'],[ 'description' => 'Boisson gazeuse au goût de pomme.', 'prix' => 600, 'id_categorie' => $catBoissons->id_categorie, 'disponible' => true, 'stock_disponible' => 90]);
        Article::firstOrCreate(['nom' => 'Eau Minérale (1.5L)'],[ 'description' => 'Bouteille d\'eau minérale naturelle.', 'prix' => 500, 'id_categorie' => $catBoissons->id_categorie, 'disponible' => true, 'stock_disponible' => 200]);


        $this->command->info('ArticleSeeder exécuté (plats et boissons spécifiques corrigés).');
    }
}