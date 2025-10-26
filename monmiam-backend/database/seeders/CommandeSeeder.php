<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Utilisateur;
use App\Models\Article;
use App\Models\Role;

class CommandeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- Prérequis : Récupérer des utilisateurs étudiants ---
        $roleEtudiant = Role::where('nom_role', 'Etudiant')->first();
        if (!$roleEtudiant) {
             $this->command->error("Rôle 'Etudiant' non trouvé. Lancez RoleSeeder d'abord.");
             return;
        }
        $etudiants = Utilisateur::where('id_role', $roleEtudiant->id_role)->inRandomOrder()->limit(2)->get();
        if ($etudiants->count() < 1) {
             $this->command->warn("Aucun étudiant trouvé. Impossible de créer des commandes.");
             return;
        }
        $etudiant1 = $etudiants->first();
        $etudiant2 = $etudiants->last();

        // --- Prérequis : Récupérer TOUS les articles nécessaires AU DÉBUT ---
        $articlesNecessaires = [
            'Ndolè Royal', 'Poulet DG', 'Poulet Rôti',
            'Boulettes de Boeuf', // <<< Nom complet ici, comme dans ArticleSeeder
            'Jus de Bissap', 'Coca-Cola', 'Malta'
        ];
        $articlesTrouves = Article::whereIn('nom', $articlesNecessaires)->get()->keyBy('nom');

        // Vérifier si TOUS les articles nécessaires existent
        foreach ($articlesNecessaires as $nomArticle) {
            if (!isset($articlesTrouves[$nomArticle])) {
                 $this->command->error("L'article '$nomArticle' est manquant. Lancez ArticleSeeder d'abord ou vérifiez les noms.");
                 return; // Arrête le seeder si un article manque
            }
        }
        // Accès facile aux articles trouvés
        $ndole = $articlesTrouves['Ndolè Royal'];
        $pouletDG = $articlesTrouves['Poulet DG'];
        $pouletRoti = $articlesTrouves['Poulet Rôti'];
        // --- CORRECTION APPLIQUÉE ICI ---
        $boulettes = $articlesTrouves['Boulettes de Boeuf']; // <<< Utilise le nom complet exact
        // --- FIN CORRECTION ---
        $bissap = $articlesTrouves['Jus de Bissap'];
        $coca = $articlesTrouves['Coca-Cola'];
        $malta = $articlesTrouves['Malta'];


        // --- Commande 1 (Statut: En préparation, plusieurs articles) ---
        $commande1 = Commande::create([
            'id_utilisateur' => $etudiant1->id_utilisateur,
            'date_commande' => now()->subMinutes(45),
            'statut' => 'En préparation',
            'type_service' => 'Livraison',
        ]);
        LigneCommande::create([ 'id_commande' => $commande1->id_commande, 'id_article' => $ndole->id_article, 'quantite' => 1, 'prix_unitaire' => $ndole->prix, 'sous_total' => $ndole->prix * 1, ]);
        LigneCommande::create([ 'id_commande' => $commande1->id_commande, 'id_article' => $bissap->id_article, 'quantite' => 2, 'prix_unitaire' => $bissap->prix, 'sous_total' => $bissap->prix * 2, ]);
        // Recalcul après ajout de toutes les lignes
        $commande1->update(['montant_total' => $commande1->lignes()->sum('sous_total')]);


        // --- Commande 2 (Statut: En attente, un plat et une boisson) ---
        $commande2 = Commande::create([
            'id_utilisateur' => $etudiant2->id_utilisateur,
            'date_commande' => now()->subMinutes(10),
            'statut' => 'En attente',
            'type_service' => 'Sur place',
        ]);
        LigneCommande::create([ 'id_commande' => $commande2->id_commande, 'id_article' => $pouletDG->id_article, 'quantite' => 1, 'prix_unitaire' => $pouletDG->prix, 'sous_total' => $pouletDG->prix * 1, ]);
        LigneCommande::create([ 'id_commande' => $commande2->id_commande, 'id_article' => $coca->id_article, 'quantite' => 1, 'prix_unitaire' => $coca->prix, 'sous_total' => $coca->prix * 1, ]);
        // Recalcul après ajout de toutes les lignes
        $commande2->update(['montant_total' => $commande2->lignes()->sum('sous_total')]);


        // --- Commande 3 (Statut: Prête, autre plat) ---
         $commande3 = Commande::create([
            'id_utilisateur' => $etudiant1->id_utilisateur,
            'date_commande' => now()->subHours(2),
            'statut' => 'Prête',
            'type_service' => 'À emporter',
        ]);
        LigneCommande::create([ 'id_commande' => $commande3->id_commande, 'id_article' => $pouletRoti->id_article, 'quantite' => 1, 'prix_unitaire' => $pouletRoti->prix, 'sous_total' => $pouletRoti->prix * 1, ]);
        LigneCommande::create([ 'id_commande' => $commande3->id_commande, 'id_article' => $malta->id_article, 'quantite' => 1, 'prix_unitaire' => $malta->prix, 'sous_total' => $malta->prix * 1, ]);
         // Recalcul après ajout de toutes les lignes
        $commande3->update(['montant_total' => $commande3->lignes()->sum('sous_total')]);

        // --- Commande 4 (Optionnel: Avec les boulettes corrigées) ---
        $commande4 = Commande::create([
            'id_utilisateur' => $etudiant2->id_utilisateur,
            'date_commande' => now()->subDays(1), // Hier
            'statut' => 'Livrée', // Statut différent
            'type_service' => 'Livraison',
        ]);
         // Utilise la variable $boulettes corrigée
         LigneCommande::create([ 'id_commande' => $commande4->id_commande, 'id_article' => $boulettes->id_article, 'quantite' => 1, 'prix_unitaire' => $boulettes->prix, 'sous_total' => $boulettes->prix * 1, ]);
         LigneCommande::create([ 'id_commande' => $commande4->id_commande, 'id_article' => $bissap->id_article, 'quantite' => 1, 'prix_unitaire' => $bissap->prix, 'sous_total' => $bissap->prix * 1, ]);
         // Recalcul après ajout de toutes les lignes
         $commande4->update(['montant_total' => $commande4->lignes()->sum('sous_total')]);


        $this->command->info('CommandeSeeder exécuté.');
    }
}