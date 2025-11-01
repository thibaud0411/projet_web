<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Str;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:utilisateur,email'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'localisation' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Get the client role (default role for new users)
        $clientRole = Role::where('nom_role', 'client')->first();

        $user = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'localisation' => $request->localisation,
            'mot_de_passe' => Hash::make($request->string('password')),
            'code_parrainage' => Str::upper(Str::random(8)),
            'id_role' => $clientRole?->id_role ?? 1,
            'points_fidelite' => 0,
            'statut_compte' => true,
            'est_actif' => true,
        ]);

        event(new Registered($user));

        // Create token for API authentication
        $token = $user->createToken('auth-token')->plainTextToken;

        return response([
            'user' => [
                'id' => $user->id_utilisateur,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'role' => $clientRole?->nom_role ?? 'client',
                'points_fidelite' => $user->points_fidelite,
            ],
            'token' => $token,
            'message' => 'Inscription réussie',
        ], 201);
    }
}
