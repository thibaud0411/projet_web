<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commande;
use App\Models\Utilisateur;
use App\Models\Paiement;    // <<<--- AJOUTÉ
use App\Models\Parrainage; // <<<--- AJOUTÉ
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // <<<--- AJOUTÉ pour requêtes avancées

class DashboardController extends Controller
{
    /**
     * Récupère les statistiques principales pour le tableau de bord.
     * (GET /api/dashboard/stats)
     */
    public function getStats(Request $request)
    {
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();
        $yesterdayStart = Carbon::yesterday()->startOfDay();
        $yesterdayEnd = Carbon::yesterday()->endOfDay();

        // --- Statistiques pour StatCards ---
        $ordersTodayCount = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])->count();
        $totalSalesToday = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])->whereNotIn('statut', ['Annulée'])->sum('montant_total');

        $roleEtudiantId = Role::where('nom_role', 'Etudiant')->value('id_role');
        $newClientsTodayCount = $roleEtudiantId
            ? Utilisateur::where('id_role', $roleEtudiantId)->whereBetween('date_inscription', [$todayStart, $todayEnd])->count()
            : 0;

        $loyaltyPointsEarnedToday = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])->whereNotIn('statut', ['Annulée'])->sum('points_gagnes');

        // --- Statistiques pour QuickStats ---

        // Ventes par Heure (Aujourd'hui)
        // Attention: ceci dépend du SGBD (syntaxe pour extraire l'heure)
        // Ceci est pour PostgreSQL. Adapte si tu utilises MySQL/SQLite.
        $salesByHour = Commande::select(
                // Extrait l'heure de la date_commande et la nomme 'hour'
                DB::raw("EXTRACT(HOUR FROM date_commande) as hour"),
                // Calcule la somme du montant_total pour chaque heure
                DB::raw("SUM(montant_total) as total")
            )
            ->whereBetween('date_commande', [$todayStart, $todayEnd])
            ->whereNotIn('statut', ['Annulée'])
            ->groupBy('hour') // Regroupe par heure
            ->orderBy('hour') // Trie par heure
            ->get()
            // Transforme le résultat pour correspondre au format attendu par le graphique
            ->map(function ($item) {
                return ['hour' => (int)$item->hour, 'total' => (float)$item->total];
            });

        // Programme Fidélité (Aujourd'hui)
        $pointsUsedToday = Paiement::whereBetween('date_paiement', [$todayStart, $todayEnd])->sum('points_utilises');
        $newReferralsToday = Parrainage::whereBetween('date_parrainage', [$todayStart, $todayEnd])->count();
        // Pour "Récompenses données", on prend juste le nombre de nouveaux parrainages aujourd'hui comme approximation
        $rewardsGivenToday = $newReferralsToday;


        // --- Assemblage Final ---
        $stats = [
            // Pour StatCards
            'ordersTodayCount' => $ordersTodayCount,
            'totalSalesToday' => (float)$totalSalesToday, // Assure que c'est un nombre
            'newClientsTodayCount' => $newClientsTodayCount,
            'loyaltyPointsEarnedToday' => (int)$loyaltyPointsEarnedToday, // Points Gagnés

             // Pour QuickStats
            'quickStats' => [
                'salesByHour' => $salesByHour, // Tableau [{hour: 12, total: 425}, ...]
                'loyaltyStats' => [
                    'pointsUsed' => (int)$pointsUsedToday,
                    'newReferrals' => $newReferralsToday,
                    'rewardsGiven' => $rewardsGivenToday,
                ]
            ],
            // TODO: Ajouter calcul des variations vs hier si besoin
             'ordersYesterdayCount' => Commande::whereBetween('date_commande', [$yesterdayStart, $yesterdayEnd])->count(),
             'totalSalesYesterday' => (float)Commande::whereBetween('date_commande', [$yesterdayStart, $yesterdayEnd])->whereNotIn('statut', ['Annulée'])->sum('montant_total'),
        ];

        return response()->json($stats);
    }
}