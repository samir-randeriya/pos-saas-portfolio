<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        try {
            $plan = Plan::findOrFail($request->plan_id);

            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $amount = (int) ($plan->price * 100);

            $order = $api->order->create([
                'amount' => $amount,
                'currency' => 'INR',
                'receipt' => 'order_' . uniqid(),
                'notes' => [
                    'user_id' => $request->user()->id,
                    'plan_id' => $plan->id,
                ],
            ]);

            return response()->json([
                'id' => $order['id'],
                'amount' => $order['amount'],
                'currency' => $order['currency'],
            ]);
        } catch (\Exception $e) {
            Log::error('Razorpay order creation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Failed to create payment order',
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'order_id' => 'required|string',
            'payment_id' => 'required|string',
            'signature' => 'required|string',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);

        // TODO: Razorpay signature verification here (recommended)

        return DB::transaction(function () use ($user, $plan, $request) {
            // Get current active subscription to determine if this is an upgrade or downgrade
            $currentSubscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->whereNull('cancelled_at')
                ->with('plan')
                ->latest('created_at')
                ->first();

            $isDowngrade = false;
            $previousPlanName = null;
            
            if ($currentSubscription && $currentSubscription->plan) {
                $previousPlanName = $currentSubscription->plan->name;
                // Check if new plan price is less than current plan price (downgrade)
                $isDowngrade = $plan->price < $currentSubscription->plan->price;
            }

            // Immediately expire ALL active subscriptions (supports immediate downgrades)
            // Gold → Silver: Gold expires immediately, Silver starts immediately
            $expiredSubscriptions = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->whereNull('cancelled_at')
                ->update([
                    'status' => 'expired',
                    'end_date' => now(), // Set end_date to now for immediate expiration
                ]);

            // Always create a NEW subscription record
            // Never reuse cancelled subscriptions to maintain data integrity
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'razorpay_payment_id' => $request->payment_id,
            ]);

            // Log appropriate action based on upgrade/downgrade
            $action = $isDowngrade ? 'subscription_downgraded' : 'subscription_upgraded';
            if (!$currentSubscription) {
                $action = 'subscription_started';
            }

            SubscriptionHistory::create([
                'subscription_id' => $subscription->id,
                'action' => $action,
            ]);

            // Log previous subscription expiration if it existed
            if ($currentSubscription) {
                SubscriptionHistory::create([
                    'subscription_id' => $currentSubscription->id,
                    'action' => 'subscription_expired_for_' . ($isDowngrade ? 'downgrade' : 'upgrade'),
                ]);
            }

            Log::info('Subscription change processed', [
                'user_id' => $user->id,
                'previous_plan' => $previousPlanName,
                'new_plan' => $plan->name,
                'is_downgrade' => $isDowngrade,
                'subscription_id' => $subscription->id,
            ]);

            $message = $isDowngrade 
                ? 'Subscription downgraded successfully. Access switched immediately.'
                : ($currentSubscription ? 'Subscription upgraded successfully.' : 'Subscription activated successfully.');

            return response()->json([
                'message' => $message,
            ]);
        });
    }
}
