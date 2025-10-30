<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Paiement;
use App\Models\Commande;

class PaiementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupère quelques commandes existantes (celles créées par CommandeSeeder)
        $commandes = Commande::orderBy('date_commande', 'desc')->limit(3)->get();

        if ($commandes->isEmpty()) {
            $this->command->warn("Aucune commande trouvée. Impossible de créer des paiements.");
            return;
        }

        // Crée un paiement pour la première commande (simule paiement partiel points)
        if ($commandes->get(0)) {
            $commande1 = $commandes->get(0);
            $pointsUtilises1 = 50; // Exemple
            $valeurPoints1 = $pointsUtilises1 * 10; // Supposons 1 point = 10 F
            Paiement::create([
                'id_commande' => $commande1->id_commande,
                'montant' => $commande1->montant_total,
                'methode_paiement' => 'carte',
                'date_paiement' => $commande1->date_commande->addMinutes(5), // Peu après la commande
                'statut_paiement' => 'valide',
                'points_utilises' => $pointsUtilises1,
                'montant_points' => $valeurPoints1,
                'montant_especes' => max(0, $commande1->montant_total - $valeurPoints1), // Ce qui reste à payer
            ]);
        }

        // Crée un paiement pour la deuxième commande (sans points)
         if ($commandes->get(1)) {
            $commande2 = $commandes->get(1);
            Paiement::create([
                'id_commande' => $commande2->id_commande,
                'montant' => $commande2->montant_total,
                'methode_paiement' => 'mobile_money',
                'date_paiement' => $commande2->date_commande->addMinutes(2),
                'statut_paiement' => 'valide',
                'points_utilises' => 0,
                'montant_points' => 0,
                'montant_especes' => $commande2->montant_total,
            ]);
        }

         // Crée un paiement pour la troisième commande (aujourd'hui, avec points)
         if ($commandes->get(2)) {
            $commande3 = $commandes->get(2);
            // Assurons-nous que cette commande date d'aujourd'hui pour les stats
            $commande3->update(['date_commande' => now()->subHours(1)]);
            $pointsUtilises3 = 100; // Exemple
            $valeurPoints3 = $pointsUtilises3 * 10;
             Paiement::create([
                'id_commande' => $commande3->id_commande,
                'montant' => $commande3->montant_total,
                'methode_paiement' => 'carte',
                'date_paiement' => now(), // Paiement effectué maintenant
                'statut_paiement' => 'valide',
                'points_utilises' => $pointsUtilises3,
                'montant_points' => $valeurPoints3,
                'montant_especes' => max(0, $commande3->montant_total - $valeurPoints3),
            ]);
         }

        $this->command->info('PaiementSeeder exécuté.');
    }
}