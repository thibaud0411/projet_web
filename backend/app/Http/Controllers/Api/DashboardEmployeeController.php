<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Commande;
use App\Models\Article;
use App\Models\Commentaire;
use Carbon\Carbon;

// Renommé selon votre demande
class DashboardEmployeeController extends Controller 
{
    /**
     * Récupère les statistiques pour la page 'Dashboard'.
     * (GET /api/dashboard-stats)
     */
    public function getStats()
    {
        $today = Carbon::today();

        // 1. Commandes du jour
        $ordersTodayCount = Commande::whereDate('date_commande', $today)->count();
        
        // 2. Tâches actives (Commandes non finies)
        $activeTasksCount = Commande::whereIn('statut', ['En attente', 'En préparation'])->count();
        
        // 3. Plats disponibles
        $menuItemsAvailable = Article::where('disponible', true)->count();
        
        // 4. Satisfaction (Moyenne des notes sur 5)
        $satisfactionScore = Commentaire::avg('note'); // ex: 4.5

        return response()->json([
            'ordersTodayCount' => $ordersTodayCount,
            'activeTasksCount' => $activeTasksCount,
            'menuItemsAvailable' => $menuItemsAvailable,
            // Convertit la note /5 en % (ex: 4.5 * 20 = 90)
            'satisfactionScore' => round($satisfactionScore * 20, 0) ?? 90, 
        ]);
    }
}