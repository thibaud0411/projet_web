<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\User;
use App\Models\LoyaltyPoint;

class ReferralService
{
    public function generateCode($userId)
    {
        return 'REF-' . strtoupper(substr(md5($userId . time()), 0, 8));
    }

    public function applyReferral($userId, $referralCode)
    {
        $referrer = User::where('referral_code', $referralCode)->first();
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
        $referrals = Referral::where('referrer_id', $referrerId)
                             ->where('rewarded', false)
                             ->get();

        foreach ($referrals as $referral) {
            $referredUser = User::find($referral->referred_id);
            if ($referredUser && $referredUser->orders()->exists()) {
                LoyaltyPoint::create([
                    'user_id' => $referrerId,
                    'points' => 5,
                    'source' => 'referral',
                    'expires_at' => now()->addMonths(12)
                ]);
                $referral->update(['rewarded' => true]);
            }
        }
    }
}
