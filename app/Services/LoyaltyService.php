<?php

namespace App\Services;

use App\Models\LoyaltyPoint;

class LoyaltyService
{
    public function addPoints($userId, $amount)
    {
        $points = floor($amount / 1000);
        if ($points > 0) {
            LoyaltyPoint::create([
                'user_id' => $userId,
                'points' => $points,
                'source' => 'order',
                'expires_at' => now()->addMonths(12)
            ]);
        }
    }

    public function usePoints($userId, $pointsToUse)
    {
        $available = LoyaltyPoint::where('user_id', $userId)->sum('points');
        if ($pointsToUse > $available) return false;

        // Logique de déduction simplifiée (à adapter si tu veux gérer par tranche)
        LoyaltyPoint::where('user_id', $userId)->limit($pointsToUse)->delete();
        return true;
    }

    public function getTotalPoints($userId)
    {
        return LoyaltyPoint::where('user_id', $userId)->sum('points');
    }
}
