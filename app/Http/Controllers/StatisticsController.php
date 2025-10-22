<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Models\Referral;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'gerant'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $totalSales = Order::sum('total_amount');
        $totalOrders = Order::count();
        $totalLoyaltyPoints = User::sum('loyalty_points');
        $totalReferrals = Referral::count();
        $activeReferrals = Referral::where('reward_obtained', true)->count();
        $pendingComplaints = Complaint::where('status', 'pending')->count();
        $resolvedComplaints = Complaint::where('status', 'resolved')->count();

        return response()->json([
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'total_loyalty_points' => $totalLoyaltyPoints,
            'total_referrals' => $totalReferrals,
            'active_referrals' => $activeReferrals,
            'pending_complaints' => $pendingComplaints,
            'resolved_complaints' => $resolvedComplaints,
        ]);
    }

    public function weeklySales()
    {
        $user = Auth::user();
        if ($user->role !== 'employee') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->endOfWeek();

        $weeklySales = Order::whereBetween('order_date', [$start, $end])->sum('total_amount');
        $weeklyOrders = Order::whereBetween('order_date', [$start, $end])->count();

        return response()->json([
            'weekly_sales' => $weeklySales,
            'weekly_orders' => $weeklyOrders,
        ]);
    }

    public function topClients(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filter = $request->query('filter', 'all');

        $query = User::where('role', 'student')->withCount('orders');

        if ($filter === 'day') {
            $today = Carbon::now()->startOfDay();
            $query = User::where('role', 'student')->withCount(['orders' => function ($q) use ($today) {
                $q->where('order_date', '>=', $today);
            }]);
        } elseif ($filter === 'week') {
            $start = Carbon::now()->startOfWeek();
            $query = User::where('role', 'student')->withCount(['orders' => function ($q) use ($start) {
                $q->where('order_date', '>=', $start);
            }]);
        } elseif ($filter === 'month') {
            $start = Carbon::now()->startOfMonth();
            $query = User::where('role', 'student')->withCount(['orders' => function ($q) use ($start) {
                $q->where('order_date', '>=', $start);
            }]);
        }

        $top = $query->orderByDesc('orders_count')->take(10)->get();

        return response()->json($top);
    }

    // Méthode pour gérer l'expiration des points (Cron Job ou tâche planifiée)
    public function expireLoyaltyPoints()
    {
        $oneYearAgo = Carbon::now()->subYear();
        User::where('updated_at', '<', $oneYearAgo)->update(['loyalty_points' => 0]);
    }
}