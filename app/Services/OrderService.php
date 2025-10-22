<?php

namespace App\Services;

use App\Models\Orders;

class OrderService
{
    public function createOrder($userId, $total, $comment = null)
    {
        return Order::create([
            'user_id' => $userId,
            'total' => $total,
            'status' => 'pending',
            'comment' => $comment
        ]);
    }

    public function getUserOrders($userId)
    {
        return Order::where('user_id', $userId)->latest()->get();
    }
}
