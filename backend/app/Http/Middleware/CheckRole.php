<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle the incoming request.
     * 
     * Usage: Route::middleware('role:administrateur,gerant')->group(...)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        // Load the role relationship if not already loaded
        $user = $request->user();
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        // Get the user's role name
        $userRole = $user->role->nom_role ?? null;

        // Check if user has one of the required roles
        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Accès non autorisé. Rôle requis: ' . implode(', ', $roles),
                'user_role' => $userRole
            ], 403);
        }

        return $next($request);
    }
}
