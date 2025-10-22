<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class PaymentService
{
    public function initiatePayment($orderId, $amount, $phone, $user)
    {
        $transaction_id = uniqid('TX_');

        $response = Http::post('https://api-checkout.cinetpay.com/v2/payment', [
            'apikey' => config('cinetpay.api_key'),
            'site_id' => config('cinetpay.site_id'),
            'transaction_id' => $transaction_id,
            'amount' => $amount,
            'currency' => 'XAF',
            'description' => 'Commande Mon Miam Miam',
            'customer_name' => $user->name,
            'customer_phone_number' => $phone,
            'customer_email' => $user->email,
            'notify_url' => route('cinetpay.callback'),
            'return_url' => route('payment.success'),
            'channels' => 'MOBILE_MONEY'
        ]);

        if ($response->successful()) {
            Payment::create([
                'order_id' => $orderId,
                'amount' => $amount,
                'method' => 'Mobile Money',
                'status' => 'pending',
                'transaction_id' => $transaction_id
            ]);

            return $response['data']['payment_url'];
        }

        return null;
    }

    public function verifyTransaction($transaction_id)
    {
        $response = Http::post('https://api-checkout.cinetpay.com/v2/payment/check', [
            'apikey' => config('cinetpay.api_key'),
            'site_id' => config('cinetpay.site_id'),
            'transaction_id' => $transaction_id
        ]);

        if ($response->successful() && $response['data']['status'] === 'ACCEPTED') {
            Payment::where('transaction_id', $transaction_id)->update(['status' => 'completed']);
            return true;
        }

        return false;
    }
}
