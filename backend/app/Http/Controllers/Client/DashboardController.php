<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Load role relationship only (not subscription to avoid old cancelled ones)
        $user->load('role');
        
        // Unset subscription relationship if it was loaded to prevent returning old cancelled subscriptions
        unset($user->subscription);

        // Admins do not have subscriptions
        if ($user->role && $user->role->name === 'admin') {
            return response()->json([
                'user' => $user,
                'subscription' => null,
                'modules' => [],
                'message' => 'Admin account'
            ]);
        }

        // Get the LATEST active subscription (not cancelled)
        // After cancellation, new subscriptions are created, so we need the most recent active one
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('cancelled_at')
            ->with('plan.modules')
            ->latest('created_at')
            ->first();

        // If no active subscription found
        if (!$subscription || !$subscription->plan) {
            return response()->json([
                'user' => $user,
                'subscription' => null,
                'modules' => [],
                'message' => 'No active subscription'
            ]);
        }

        // Double-check: ensure subscription is truly active
        if ($subscription->cancelled_at || $subscription->status !== 'active') {
            return response()->json([
                'user' => $user,
                'subscription' => null,
                'modules' => [],
                'message' => 'Subscription cancelled or expired'
            ]);
        }

        return response()->json([
            'user' => $user,
            'subscription' => $subscription,
            'modules' => $subscription->plan->modules ?? []
        ]);
    }

    public function requestCancel(Request $request)
    {
        $user = $request->user();
        
        // Get the latest active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('cancelled_at')
            ->latest('created_at')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription'], 400);
        }

        $subscription->update([
            'cancel_requested_at' => now(),
            'cancel_reason' => $request->reason ?? null,
        ]);

        SubscriptionHistory::create([
            'subscription_id' => $subscription->id,
            'action' => 'cancel_requested',
        ]);

        return response()->json([
            'message' => 'Cancellation request submitted'
        ]);
    }

    public function cancelRequest(Request $request)
    {   
        $user = $request->user();
        
        // Get the latest active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('cancelled_at')
            ->latest('created_at')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription'], 400);
        }

        $subscription->update([
            'cancel_requested_at' => null,
            'cancel_reason' => null,
        ]);

        SubscriptionHistory::create([
            'subscription_id' => $subscription->id,
            'action' => 'cancel_request_withdrawn',
        ]);

        return response()->json(['message' => 'Cancellation request withdrawn']);
    }
}
