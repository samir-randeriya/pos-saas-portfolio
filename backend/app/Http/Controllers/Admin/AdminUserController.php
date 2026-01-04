<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with role & subscription
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['role'])
            ->where('id', '!=', $request->user()->id);

        /**
         * 🔍 Search by name or email
         */
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        /**
         * 📌 Filter by subscription status (clients only)
         */
        if ($request->filled('status')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('subscription', function ($sub) use ($request) {
                    $sub->where('status', $request->status);
                })
                ->orWhereDoesntHave('subscription'); // include admins
            });
        }

        /**
         * 📦 Filter by plan (clients only)
         */
        if ($request->filled('plan')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('subscription.plan', function ($sub) use ($request) {
                    $sub->where('name', $request->plan);
                })
                ->orWhereDoesntHave('subscription'); // include admins
            });
        }

        /**
         * 🔃 Sorting (safe allowlist recommended)
         */
        $allowedSorts = ['created_at', 'name', 'email'];
        $sortBy = in_array($request->get('sort_by'), $allowedSorts)
            ? $request->get('sort_by')
            : 'created_at';

        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $order);

        $users = $query->paginate(10);
        
        // Load latest active subscription for each user
        foreach ($users->items() as $user) {
            $user->subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->whereNull('cancelled_at')
                ->with('plan')
                ->latest('created_at')
                ->first();
        }

        return response()->json($users);
    }

    /**
     * Single user detail
     */
    public function show($id)
    {
        $user = User::with(['role', 'subscription.plan.modules'])->findOrFail($id);

        return response()->json($user);
    }
}
