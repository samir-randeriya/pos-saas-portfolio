<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();
        
        // Admins don't have subscriptions, so they can't access module-protected routes
        if ($user->role?->name === 'admin') {
            return response()->json(['message' => 'Admins cannot access client modules'], 403);
        }
        
        // Check if user has subscription
        if (!$user->subscription) {
            return response()->json(['message' => 'No active subscription'], 403);
        }
        
        // Check if subscription has plan
        if (!$user->subscription->plan) {
            return response()->json(['message' => 'Subscription plan not found'], 403);
        }
        
        // Get modules from plan
        $modules = $user->subscription->plan->modules->pluck('name')->toArray();
    
        if (!in_array($module, $modules)) {
            return response()->json(['message' => 'Module access denied'], 403);
        }
    
        return $next($request);
    }
}
