<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboard(Request $request)
    {
        try {
            // Today's revenue
            $dailyRevenue = DB::table('commandes')
                ->whereDate('date_commande', today())
                ->where('statut', 'livree')
                ->sum('montant_total');

            // Total orders count
            $totalOrders = DB::table('commandes')
                ->whereDate('date_commande', today())
                ->count();

            // Active customers (users who ordered in last 30 days)
            $activeCustomers = DB::table('commandes')
                ->where('date_commande', '>=', now()->subDays(30))
                ->distinct('id_utilisateur')
                ->count('id_utilisateur');

            // Satisfaction rate (based on resolved complaints vs total)
            $totalComplaints = DB::table('reclamations')->count();
            $resolvedComplaints = DB::table('reclamations')
                ->where('statut', 'resolue')
                ->count();
            $satisfactionRate = $totalComplaints > 0 
                ? round(($resolvedComplaints / $totalComplaints) * 100, 1)
                : 100;

            // Recent orders
            $recentOrders = DB::table('commandes')
                ->join('users', 'commandes.id_utilisateur', '=', 'users.id')
                ->select([
                    'commandes.id',
                    'commandes.numero_commande',
                    'commandes.montant_total',
                    'commandes.statut',
                    'commandes.date_commande',
                    'users.prenom as client_prenom',
                    'users.nom as client_nom'
                ])
                ->orderBy('commandes.date_commande', 'DESC')
                ->limit(10)
                ->get();

            return response()->json([
                'daily_revenue' => $dailyRevenue,
                'total_orders' => $totalOrders,
                'active_customers' => $activeCustomers,
                'satisfaction_rate' => $satisfactionRate,
                'recent_orders' => $recentOrders,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue data by period
     */
    public function revenue(Request $request)
    {
        $period = $request->get('period', 'week');
        
        try {
            $query = DB::table('commandes')
                ->where('statut', 'livree');

            switch ($period) {
                case 'day':
                    $query->whereDate('date_commande', '>=', now()->subDays(7));
                    $data = $query->select(
                        DB::raw('DATE(date_commande) as periode'),
                        DB::raw('COUNT(id) as nombre_commandes'),
                        DB::raw('COALESCE(SUM(montant_total), 0) as chiffre_affaires')
                    )
                    ->groupBy('periode')
                    ->orderBy('periode')
                    ->get();
                    break;

                case 'week':
                    $query->whereDate('date_commande', '>=', now()->subWeeks(8));
                    $data = $query->select(
                        DB::raw('YEARWEEK(date_commande) as periode'),
                        DB::raw('COUNT(id) as nombre_commandes'),
                        DB::raw('COALESCE(SUM(montant_total), 0) as chiffre_affaires')
                    )
                    ->groupBy('periode')
                    ->orderBy('periode')
                    ->get();
                    break;

                case 'month':
                    $query->whereDate('date_commande', '>=', now()->subMonths(12));
                    $data = $query->select(
                        DB::raw('DATE_FORMAT(date_commande, "%Y-%m") as periode'),
                        DB::raw('COUNT(id) as nombre_commandes'),
                        DB::raw('COALESCE(SUM(montant_total), 0) as chiffre_affaires')
                    )
                    ->groupBy('periode')
                    ->orderBy('periode')
                    ->get();
                    break;

                default:
                    $data = collect();
            }

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}