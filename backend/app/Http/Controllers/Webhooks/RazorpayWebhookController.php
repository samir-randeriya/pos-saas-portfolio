<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;

class RazorpayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('X-Razorpay-Signature');

        $expectedSignature = hash_hmac(
            'sha256',
            $payload,
            config('services.razorpay.webhook_secret')
        );

        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Razorpay webhook signature mismatch');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');

        if ($event === 'payment.captured') {
            $this->handlePaymentCaptured(
                $request->input('payload.payment.entity')
            );
        }

        return response()->json(['status' => 'ok']);
    }

    protected function handlePaymentCaptured(array $payment)
    {
        // ✅ Idempotency check
        if (
            Subscription::where(
                'razorpay_payment_id',
                $payment['id']
            )->exists()
        ) {
            Log::info('Duplicate Razorpay webhook ignored', [
                'payment_id' => $payment['id']
            ]);
            return;
        }

        $userId = $payment['notes']['user_id'] ?? null;
        $planId = $payment['notes']['plan_id'] ?? null;

        if (!$userId || !$planId) {
            Log::error('Missing Razorpay payment notes', $payment);
            return;
        }

        $plan = Plan::find($planId);
        if (!$plan) {
            Log::error('Plan not found in Razorpay webhook', ['plan_id' => $planId]);
            return;
        }

        return DB::transaction(function () use ($userId, $plan, $payment) {
            // Get current active subscription to determine if this is a downgrade
            $currentSubscription = Subscription::where('user_id', $userId)
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
            Subscription::where('user_id', $userId)
                ->where('status', 'active')
                ->whereNull('cancelled_at')
                ->update([
                    'status' => 'expired',
                    'end_date' => now(), // Set end_date to now for immediate expiration
                ]);

            // Always create a NEW subscription record
            // Never reuse cancelled subscriptions to maintain data integrity
            $subscription = Subscription::create([
                'user_id' => $userId,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'razorpay_payment_id' => $payment['id'],
            ]);

            // Log appropriate action based on upgrade/downgrade
            $action = $isDowngrade ? 'subscription_downgraded_via_webhook' : 'subscription_upgraded_via_webhook';
            if (!$currentSubscription) {
                $action = 'subscription_started_via_webhook';
            }

            SubscriptionHistory::create([
                'subscription_id' => $subscription->id,
                'action' => $action,
            ]);

            // Log previous subscription expiration if it existed
            if ($currentSubscription) {
                SubscriptionHistory::create([
                    'subscription_id' => $currentSubscription->id,
                    'action' => 'subscription_expired_for_' . ($isDowngrade ? 'downgrade' : 'upgrade') . '_via_webhook',
                ]);
            }

            Log::info('Subscription change processed via webhook', [
                'user_id' => $userId,
                'previous_plan' => $previousPlanName,
                'new_plan' => $plan->name,
                'is_downgrade' => $isDowngrade,
                'subscription_id' => $subscription->id,
                'payment_id' => $payment['id'],
            ]);
        });
    }
}
