<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commande;
use App\Models\Utilisateur;
use App\Models\Paiement;
use App\Models\Parrainage;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // N'oubliez pas d'importer DB

class DashboardController extends Controller
{
    /**
     * Récupère les statistiques globales pour le tableau de bord.
     * (GET /api/dashboard/stats)
     */
    public function getStats(Request $request)
    {
        // --- Définition des plages de dates ---
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();
        $yesterdayStart = Carbon::yesterday()->startOfDay();
        $yesterdayEnd = Carbon::yesterday()->endOfDay();
        
        $startOfWeek = Carbon::now()->startOfWeek(); // Lundi
        $endOfWeek = Carbon::now()->endOfWeek();     // Dimanche

        // --- 1. Statistiques pour StatCards (Haut de page) ---
        $ordersTodayCount = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])->count();
        
        $totalSalesToday = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])
                                   ->whereNotIn('statut', ['Annulée'])
                                   ->sum('montant_total');

        // Compte les nouveaux clients (basé sur le rôle 'Etudiant' de votre RoleSeeder)
        $roleEtudiantId = Role::where('nom_role', 'Etudiant')->value('id_role');
        $newClientsTodayCount = $roleEtudiantId
            ? Utilisateur::where('id_role', $roleEtudiantId)->whereBetween('date_inscription', [$todayStart, $todayEnd])->count()
            : 0;

        $loyaltyPointsEarnedToday = Commande::whereBetween('date_commande', [$todayStart, $todayEnd])
                                            ->whereNotIn('statut', ['Annulée'])
                                            ->sum('points_gagnes');

        
        // --- 2. Statistiques pour QuickStats (JOUR) ---

        // Ventes par Heure (Aujourd'hui)
        $salesByHour = Commande::select(
                DB::raw("EXTRACT(HOUR FROM date_commande) as hour"),
                DB::raw("SUM(montant_total) as total")
            )
            ->whereBetween('date_commande', [$todayStart, $todayEnd])
            ->whereNotIn('statut', ['Annulée'])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return ['hour' => (int)$item->hour, 'total' => (float)$item->total];
            });

        // Programme Fidélité (Aujourd'hui)
        $pointsUsedToday = Paiement::whereBetween('date_paiement', [$todayStart, $todayEnd])->sum('points_utilises');
        $newReferralsToday = Parrainage::whereBetween('date_parrainage', [$todayStart, $todayEnd])->count();
        $rewardsGivenToday = $newReferralsToday; // Logique simplifiée


        // --- 3. Statistiques pour QuickStats (SEMAINE) ---

        // Ventes par Jour (Semaine)
        // Note: EXTRACT(DOW ...) 0=Dim, 1=Lun, ... 6=Sam (pour PostgreSQL)
        $salesByDayOfWeek = Commande::select(
                DB::raw("EXTRACT(DOW FROM date_commande) as day"), // DOW = Day Of Week
                DB::raw("SUM(montant_total) as total")
            )
            ->whereBetween('date_commande', [$startOfWeek, $endOfWeek])
            ->whereNotIn('statut', ['Annulée'])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($item) {
                return ['day' => (int)$item->day, 'total' => (float)$item->total];
            });

        // Programme Fidélité (Semaine)
        $pointsUsedWeekly = Paiement::whereBetween('date_paiement', [$startOfWeek, $endOfWeek])->sum('points_utilises');
        $newReferralsWeekly = Parrainage::whereBetween('date_parrainage', [$startOfWeek, $endOfWeek])->count();
        $rewardsGivenWeekly = $newReferralsWeekly;


        // --- 4. Statistiques de la veille (pour comparaison) ---
        $ordersYesterdayCount = Commande::whereBetween('date_commande', [$yesterdayStart, $yesterdayEnd])->count();
        $totalSalesYesterday = (float)Commande::whereBetween('date_commande', [$yesterdayStart, $yesterdayEnd])->whereNotIn('statut', ['Annulée'])->sum('montant_total');


        // --- 5. Assemblage Final (Structure plate) ---
        // Cette structure correspond à l'interface de GeneralStatsPage.tsx
        return response()->json([
            // Pour StatCards
            'ordersTodayCount' => $ordersTodayCount,
            'totalSalesToday' => (float)$totalSalesToday,
            'newClientsTodayCount' => $newClientsTodayCount,
            'loyaltyPointsEarnedToday' => (int)$loyaltyPointsEarnedToday,

             // Pour QuickStats
            'quickStats' => [
                'salesByHour' => $salesByHour,
                'loyaltyStats' => [
                    'pointsUsed' => (int)$pointsUsedToday,
                    'newReferrals' => $newReferralsToday,
                    'rewardsGiven' => $rewardsGivenToday,
                ],
                'salesByDayOfWeek' => $salesByDayOfWeek,
                'loyaltyStatsWeekly' => [
                    'pointsUsed' => (int)$pointsUsedWeekly,
                    'newReferrals' => $newReferralsWeekly,
                    'rewardsGiven' => $rewardsGivenWeekly,
                ]
            ],
            
             // Pour les comparaisons
             'ordersYesterdayCount' => $ordersYesterdayCount,
             'totalSalesYesterday' => $totalSalesYesterday,
        ]);
    }
}