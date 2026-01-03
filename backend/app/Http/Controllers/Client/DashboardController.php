<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;

        return response()->json([
            'user' => $user,
            'subscription' => $subscription,
            'modules' => $subscription->plan->modules
        ]);
    }
}
