<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuItemsSeeder extends Seeder
{
    public function run(): void
    {
        $menuItems = [
            [
                'nom' => 'Poulet Yassa',
                'description' => 'Poulet mariné',
                'prix' => 1500,
                'id_categorie' => 1, // À remplacer par l'ID de la catégorie appropriée
                'disponible' => true,
                'image_url' => 'https://i.pinimg.com/1200x/e9/84/a9/e984a924010b724ccd3e03373edb1c52.jpg',
                'est_promotion' => false,
                'stock_disponible' => 100,
            ],
            [
                'nom' => 'Poisson Braisé',
                'description' => 'Poisson et persil',
                'prix' => 1500,
                'id_categorie' => 1, // À remplacer par l'ID de la catégorie appropriée
                'disponible' => true,
                'image_url' => 'https://i.pinimg.com/736x/8d/4a/fc/8d4afc3c36d918b914a2730e7c3691dd.jpg',
                'est_promotion' => false,
                'stock_disponible' => 100,
            ],
            [
                'nom' => 'Macaroni',
                'description' => 'Macaroni viande hachée et sauce tomate',
                'prix' => 1000,
                'id_categorie' => 1, // À remplacer par l'ID de la catégorie appropriée
                'disponible' => true,
                'image_url' => 'https://i.pinimg.com/1200x/7a/d1/d2/7ad1d28c836140682bb005040aaafe02.jpg',
                'est_promotion' => false,
                'stock_disponible' => 100,
            ],
            [
                'nom' => 'Bolognaise',
                'description' => 'Spaghetti à la sauce bolognaise boulette',
                'prix' => 1000,
                'id_categorie' => 1, // À remplacer par l'ID de la catégorie appropriée
                'disponible' => true,
                'image_url' => 'https://i.pinimg.com/1200x/60/28/e5/6028e5a0316ee9006e8caaccd58b83f5.jpg',
                'est_promotion' => false,
                'stock_disponible' => 100,
            ],
            [
                'nom' => 'Jus de Bissap',
                'description' => 'Boisson traditionnelle à l\'hibiscus',
                'prix' => 500,
                'id_categorie' => 2, // À remplacer par l'ID de la catégorie Boissons
                'disponible' => true,
                'image_url' => 'https://i.pinimg.com/1200x/16/cb/6c/16cb6c4b4d6d908daae2702b93b7ca9d.jpg',
                'est_promotion' => false,
                'stock_disponible' => 200,
            ],
            [
                'nom' => 'Okok',
                'description' => 'Okok salé comme sucré',
                'prix' => 1000,
                'id_categorie' => 1, // À remplacer par l'ID de la catégorie appropriée
                'disponible' => false,
                'image_url' => 'https://i.pinimg.com/736x/4f/57/17/4f57178313dc91862672ca85572284df.jpg',
                'est_promotion' => false,
                'stock_disponible' => 0,
            ],
        ];

        foreach ($menuItems as $item) {
            DB::table('article')->insert(array_merge($item, [
                'date_creation' => now(),
                'date_modification' => now(),
            ]));
        }
    }
}