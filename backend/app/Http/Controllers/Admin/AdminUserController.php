<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with role & subscription
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['role', 'subscription.plan']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('subscription', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        if ($request->filled('plan')) {
            $query->whereHas('subscription.plan', function ($q) use ($request) {
                $q->where('name', $request->plan);
            });
        }

        $query->orderBy(
            $request->get('sort_by', 'created_at'),
            $request->get('order', 'desc')
        );

        return response()->json(
            $query->paginate(10)
        );
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
