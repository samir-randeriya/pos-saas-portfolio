<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\Models\Plan;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $plan = Plan::findOrFail($request->plan_id);

        $api = new Api(
            config('services.razorpay.key'),
            config('services.razorpay.secret')
        );

        $order = $api->order->create([
            'amount' => $plan->price * 100,
            'currency' => 'INR'
        ]);

        return response()->json($order);
    }

    public function verify(Request $request)
    {
        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);

        // Signature verification (simplified for now)
        $user->subscription()->update([
            'plan_id' => $plan->id,
            'start_date' => now(),
            'end_date' => now()->addDays($plan->duration_days),
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Subscription upgraded']);
    }


}
