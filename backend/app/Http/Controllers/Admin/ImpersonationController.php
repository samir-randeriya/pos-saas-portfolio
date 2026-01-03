<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Impersonation;
use App\Models\User;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    
    public function impersonate($userId, Request $request)
    {
        $admin = $request->user();
        $user = User::findOrFail($userId);

        if ($admin->role->name !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create token for impersonation
        $token = $user->createToken('impersonation')->plainTextToken;

        Impersonation::create([
            'admin_id' => $admin->id,
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addMinutes(30),
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user,
            'impersonating' => true
        ]);
    }

    public function exit(Request $request)
    {
        $token = $request->bearerToken();

        $impersonation = Impersonation::where('token', $token)->first();

        if (!$impersonation) {
            return response()->json(['message' => 'Invalid impersonation'], 400);
        }

        // Revoke impersonation token
        $request->user()->currentAccessToken()->delete();

        // Cleanup
        $impersonation->delete();

        return response()->json(['message' => 'Impersonation ended']);
    }

}
