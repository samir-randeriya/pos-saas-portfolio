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
        $modules = $user->subscription->plan->modules->pluck('name')->toArray();
    
        if (!in_array($module, $modules)) {
            return response()->json(['message' => 'Module access denied'], 403);
        }
    
        return $next($request);
    }
}
