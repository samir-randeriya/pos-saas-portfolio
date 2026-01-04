<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionHistory;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminSubscriptionController extends Controller
{
    /**
     * List subscriptions
     */
    public function index(Request $request)
    {
        $query = Subscription::with(['user', 'plan']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('plan')) {
            $query->whereHas('plan', function ($q) use ($request) {
                $q->where('name', $request->plan);
            });
        }

        return response()->json(
            $query->paginate(10)
        );
    }

    public function cancel($id)
    {
        return DB::transaction(function () use ($id) {
            $subscription = Subscription::findOrFail($id);

            $subscription->update([
                'status' => 'canceled',
                'cancelled_at' => now(),
                'end_date' => now(), // Immediate cancellation
            ]);

            SubscriptionHistory::create([
                'subscription_id' => $subscription->id,
                'action' => 'cancelled_by_admin',
            ]);

            Log::info('Admin cancelled subscription', [
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'plan_id' => $subscription->plan_id,
            ]);

            return response()->json(['message' => 'Subscription cancelled successfully']);
        });
    }

    public function history($id)
    {
        return SubscriptionHistory::where('subscription_id', $id)->latest()->get();
    }

    /**
     * Admin change plan (upgrade/downgrade) - No payment required
     * This is an entitlement action, not a billing action
     */
    public function changePlan(Request $request, $userId)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'reason' => 'nullable|string|max:500',
        ]);

        // Prevent admin from changing their own plan (optional safety check)
        if ($request->user()->id == $userId) {
            return response()->json([
                'message' => 'You cannot change your own subscription plan'
            ], 403);
        }

        return DB::transaction(function () use ($request, $userId) {
            // Find user
            $user = User::findOrFail($userId);
            
            // Find selected plan
            $newPlan = Plan::findOrFail($request->plan_id);
            
            // Get current active subscription
            $currentSubscription = Subscription::where('user_id', $userId)
                ->where('status', 'active')
                ->whereNull('cancelled_at')
                ->with('plan')
                ->latest('created_at')
                ->first();

            // Plan ranking for upgrade/downgrade detection
            $planRank = [
                'free' => 0,
                'silver' => 1,
                'gold' => 2,
            ];

            $currentPlanRank = 0;
            $newPlanRank = $planRank[strtolower($newPlan->name)] ?? 0;
            
            $isUpgrade = false;
            $isDowngrade = false;
            $previousPlanName = null;

            if ($currentSubscription && $currentSubscription->plan) {
                $previousPlanName = $currentSubscription->plan->name;
                $currentPlanRank = $planRank[strtolower($previousPlanName)] ?? 0;
                
                // Determine if upgrade or downgrade
                if ($newPlanRank > $currentPlanRank) {
                    $isUpgrade = true;
                } elseif ($newPlanRank < $currentPlanRank) {
                    $isDowngrade = true;
                } else {
                    // Same plan selected
                    return response()->json([
                        'message' => 'User is already on this plan'
                    ], 400);
                }
            }

            // Expire current subscription if exists
            if ($currentSubscription) {
                $currentSubscription->update([
                    'status' => 'expired',
                    'end_date' => now(), // Immediate expiration
                ]);

                // Log expiration
                SubscriptionHistory::create([
                    'subscription_id' => $currentSubscription->id,
                    'action' => 'subscription_expired_for_admin_' . ($isDowngrade ? 'downgrade' : 'upgrade'),
                ]);
            }

            // Create new subscription immediately
            $subscription = Subscription::create([
                'user_id' => $userId,
                'plan_id' => $newPlan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($newPlan->duration_days),
                'status' => 'active',
            ]);

            // Log admin action
            $action = $isUpgrade 
                ? 'admin_upgraded' 
                : ($isDowngrade 
                    ? 'admin_downgraded' 
                    : 'admin_plan_granted');

            SubscriptionHistory::create([
                'subscription_id' => $subscription->id,
                'action' => $action,
            ]);

            Log::info('Admin changed user plan', [
                'admin_id' => $request->user()->id,
                'user_id' => $userId,
                'previous_plan' => $previousPlanName,
                'new_plan' => $newPlan->name,
                'is_upgrade' => $isUpgrade,
                'is_downgrade' => $isDowngrade,
                'subscription_id' => $subscription->id,
                'reason' => $request->reason,
            ]);

            $message = $isUpgrade
                ? "User upgraded from {$previousPlanName} to {$newPlan->name} successfully"
                : ($isDowngrade
                    ? "User downgraded from {$previousPlanName} to {$newPlan->name} successfully"
                    : "Plan {$newPlan->name} granted to user successfully");

            return response()->json([
                'message' => $message,
                'subscription' => $subscription->load('plan'),
            ]);
        });
    }

}
