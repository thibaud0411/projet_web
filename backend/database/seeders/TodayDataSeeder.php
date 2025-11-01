<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Article;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon; // Important pour les dates

class TodayDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Utilise Carbon::now() pour que les données correspondent au "aujourd'hui" du contrôleur
        $today = Carbon::now()->startOfDay();
        $tomorrow = Carbon::now()->addDay()->startOfDay();

        // --- 1. Récupérer des articles pour les commandes ---
        $articles = Article::take(5)->get();

        if ($articles->isEmpty()) {
            $this->command->error('Aucun article trouvé. Veuillez exécuter ArticleSeeder en premier.');
            return;
        }

        $article1 = $articles->get(0);
        $article2 = $articles->get(1 % $articles->count());
        $article3 = $articles->get(2 % $articles->count());

        // --- 2. Créer de nouveaux utilisateurs ---

        $userToday = Utilisateur::firstOrCreate(
            ['email' => 'client.today@example.com'],
            [
                'nom' => 'Aujourd\'hui',
                'prenom' => 'Client',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '11223344',
                'id_role' => 1, 
                'date_inscription' => $today->copy()->setTime(9, 30, 0),
                'date_modification' => $today->copy()->setTime(9, 30, 0),
            ]
        );

        $userTomorrow = Utilisateur::firstOrCreate(
             ['email' => 'acheteur.tomorrow@example.com'],
             [
                'nom' => 'Demain',
                'prenom' => 'Acheteur',
                'mot_de_passe' => Hash::make('password'),
                'telephone' => '55667788',
                'id_role' => 1,
                'date_inscription' => $tomorrow->copy()->setTime(10, 0, 0),
                'date_modification' => $tomorrow->copy()->setTime(10, 0, 0),
            ]
        );
        
        $this->command->info('Utilisateurs (aujourd\'hui et demain) créés.');

        // --- 3. Créer des commandes pour AUJOURD'HUI ---

        $commande1 = Commande::create([
            'id_utilisateur' => $userToday->id_utilisateur,
            'montant_total' => 0, 
            'statut' => 'En attente',
            'date_commande' => $today->copy()->setTime(11, 15, 0),
        ]);
        
        $total1 = ($article1->prix * 2) + ($article2->prix * 1);
        LigneCommande::create(['id_commande' => $commande1->id_commande, 'id_article' => $article1->id_article, 'quantite' => 2, 'prix_unitaire' => $article1->prix]);
        LigneCommande::create(['id_commande' => $commande1->id_commande, 'id_article' => $article2->id_article, 'quantite' => 1, 'prix_unitaire' => $article2->prix]);
        $commande1->update(['montant_total' => $total1]);

        $commande2 = Commande::create([
            'id_utilisateur' => $userToday->id_utilisateur,
            'montant_total' => 0,
            'statut' => 'En préparation',
            'date_commande' => $today->copy()->setTime(14, 30, 0),
        ]);
        
        $total2 = ($article3->prix * 5);
        LigneCommande::create(['id_commande' => $commande2->id_commande, 'id_article' => $article3->id_article, 'quantite' => 5, 'prix_unitaire' => $article3->prix]);
        $commande2->update(['montant_total' => $total2]);

        // --- 4. Créer une commande pour DEMAIN ---

        $commande3 = Commande::create([
            'id_utilisateur' => $userTomorrow->id_utilisateur,
            'montant_total' => 0,
            'statut' => 'En attente',
            'date_commande' => $tomorrow->copy()->setTime(11, 0, 0),
        ]);
        
        $total3 = ($article1->prix * 1) + ($article3->prix * 1);
        LigneCommande::create(['id_commande' => $commande3->id_commande, 'id_article' => $article1->id_article, 'quantite' => 1, 'prix_unitaire' => $article1->prix]);
        LigneCommande::create(['id_commande' => $commande3->id_commande, 'id_article' => $article3->id_article, 'quantite' => 1, 'prix_unitaire' => $article3->prix]);
        $commande3->update(['montant_total' => $total3]);

        $this->command->info('Commandes (aujourd\'hui et demain) créées.');
    }
}