<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function process(Request $request)
    {
        $transaction_id = uniqid('TX_');

        $response = Http::post('https://api-checkout.cinetpay.com/v2/payment', [
            'apikey' => config('cinetpay.api_key'),
            'site_id' => config('cinetpay.site_id'),
            'transaction_id' => $transaction_id,
            'amount' => $request->amount,
            'currency' => 'XAF',
            'description' => 'Commande Mon Miam Miam',
            'customer_name' => auth()->user()->name,
            'customer_phone_number' => $request->phone,
            'customer_email' => auth()->user()->email,
            'notify_url' => route('cinetpay.callback'),
            'return_url' => route('payment.success'),
            'channels' => 'MOBILE_MONEY'
        ]);

        if ($response->successful()) {
            Payment::create([
                'order_id' => $request->order_id,
                'amount' => $request->amount,
                'method' => 'Mobile Money',
                'status' => 'pending',
                'transaction_id' => $transaction_id
            ]);

            return response()->json(['payment_url' => $response['data']['payment_url']]);
        }

        return response()->json(['error' => 'Échec de paiement'], 500);
    }

    public function callback(Request $request)
    {
        $transaction_id = $request->transaction_id;

        $response = Http::post('https://api-checkout.cinetpay.com/v2/payment/check', [
            'apikey' => config('cinetpay.api_key'),
            'site_id' => config('cinetpay.site_id'),
            'transaction_id' => $transaction_id
        ]);

        if ($response->successful() && $response['data']['status'] === 'ACCEPTED') {
            Payment::where('transaction_id', $transaction_id)->update(['status' => 'completed']);
        }
    }
}
