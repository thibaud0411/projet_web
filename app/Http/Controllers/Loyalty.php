<?php

namespace App\Http\Controllers;

use App\Models\LoyaltyPoint;

class Loyalty extends Controller
{
    public function getPoints()
    {
        $total = LoyaltyPoint::where('user_id', auth()->id())->sum('points');
        return response()->json(['points' => $total]);
    }

    public function history()
    {
        return LoyaltyPoint::where('user_id', auth()->id())->latest()->get();
    }
}
