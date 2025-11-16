<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Services\LoyaltyService;

class OrderController extends Controller
{
    public function store(Request $request, LoyaltyService $loyalty)
    {
        $order = Order::create([
            'user_id' => auth()->id(),
            'total' => $request->total,
            'status' => 'pending',
            'comment' => $request->comment
        ]);

        $loyalty->addPoints(auth()->id(), $order->total);

        return response()->json($order);
    }

    public function history()
    {
        return Order::where('user_id', auth()->id())->latest()->get();
    }
}
