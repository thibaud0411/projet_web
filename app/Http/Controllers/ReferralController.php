<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\User;
use App\Models\LoyaltyPoint;

class ReferralController
{
    public function generateCode($userId)
    {
        return 'REF-' . strtoupper(substr(md5($userId . time()), 0, 8));
    }

    public function applyCode($userId, $referrerCode)
    {
        $referrer = User::where('referral_code', $referrerCode)->first();
        if (!$referrer) return false;

        Referral::create([
            'referrer_id' => $referrer->id,
            'referred_id' => $userId,
            'rewarded' => false
        ]);

        return true;
    }

    public function rewardReferrer($referrerId)
    {
        // Vérifie les filleuls non encore récompensés
        $referrals = Referral::where('referrer_id', $referrerId)
                             ->where('rewarded', false)
                             ->get();

        foreach ($referrals as $referral) {
            $referredUser = User::find($referral->referred_id);

            // Vérifie si le filleul a passé au moins une commande
            if ($referredUser && $referredUser->orders()->exists()) {
                // Ajoute les points de fidélité au parrain
                LoyaltyPoint::create([
                    'user_id' => $referrerId,
                    'points' => 5, // Exemple : 5 points par filleul actif
                    'source' => 'referral',
                    'expires_at' => now()->addMonths(12)
                ]);

                // Marque la récompense comme attribuée
                $referral->update(['rewarded' => true]);
            }
        }
    }
}
