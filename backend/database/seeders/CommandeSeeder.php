<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Article;

class CommandeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer une commande test
        $commande = Commande::create([
            'id_utilisateur' => 1, // Utilisateur admin par défaut
            'montant_total' => 0,
            'points_gagnes' => 0,
            'type_service' => 'sur_place',
            'heure_arrivee' => now()->addHour(),
            'statut' => 'en_attente',
            'numero_commande' => 'CMD-' . strtoupper(substr(uniqid(), -6)),
        ]);

        // Récupérer un article aléatoire
        $article = Article::inRandomOrder()->first();
        if ($article) {
            // Ajouter une ligne de commande
            $ligne = LigneCommande::create([
                'id_commande' => $commande->id_commande,
                'id_article' => $article->id_article,
                'quantite' => 2,
                'prix_unitaire' => $article->prix,
                'sous_total' => $article->prix * 2,
                'commentaire_article' => 'Commande test'
            ]);

            // Mettre à jour le montant total de la commande
            $commande->update([
                'montant_total' => $ligne->sous_total
            ]);
        }
    }
}