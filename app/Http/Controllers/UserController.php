<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'gerant'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return User::all();
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'gerant'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:255|unique:users',
            'password' => ['required', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'role' => 'required|in:employee,gerant',
        ]);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json($newUser, 201);
    }

    // Méthodes update et destroy similaires (non détaillées pour brièveté, implémentez avec validation rôle)

    public function generateReferralCode()
    {
        $user = Auth::user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can generate referral codes'], 403);
        }

        if ($user->referral_code) {
            return response()->json(['message' => 'Referral code already generated', 'code' => $user->referral_code]);
        }

        $code = Str::random(10);
        while (User::where('referral_code', $code)->exists()) {
            $code = Str::random(10);
        }

        $user->referral_code = $code;
        $user->save();

        return response()->json(['code' => $code]);
    }
}