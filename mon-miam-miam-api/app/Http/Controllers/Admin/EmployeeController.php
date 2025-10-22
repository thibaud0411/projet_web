<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index(Request $request)
    {
        $employees = DB::table('users')
            ->whereIn('role', ['employe', 'gerant'])
            ->select([
                'id',
                'nom',
                'prenom',
                'email',
                'telephone',
                'role',
                'statut_compte',
                'created_at'
            ])
            ->orderBy('created_at', 'DESC')
            ->get();

        return response()->json($employees);
    }

    /**
     * Create new employee
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'role' => ['required', Rule::in(['employe', 'gerant'])],
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[A-Z])(?=.*\d)/',
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule et un chiffre.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create user in Supabase auth
            $userId = $this->createSupabaseUser($request->email, $request->password);

            // Insert into users table
            DB::table('users')->insert([
                'id' => $userId,
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'role' => $request->role,
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Employé créé avec succès',
                'data' => DB::table('users')->where('id', $userId)->first()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single employee
     */
    public function show($id)
    {
        $employee = DB::table('users')
            ->where('id', $id)
            ->whereIn('role', ['employe', 'gerant'])
            ->first();

        if (!$employee) {
            return response()->json(['message' => 'Employé non trouvé'], 404);
        }

        return response()->json($employee);
    }

    /**
     * Update employee
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'telephone' => 'sometimes|string|max:20',
            'role' => ['sometimes', Rule::in(['employe', 'gerant'])],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'regex:/^(?=.*[A-Z])(?=.*\d)/',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only(['nom', 'prenom', 'email', 'telephone', 'role']);
            $updateData['updated_at'] = now();

            // Update password in Supabase if provided
            if ($request->has('password')) {
                $this->updateSupabasePassword($id, $request->password);
            }

            DB::table('users')
                ->where('id', $id)
                ->update($updateData);

            return response()->json([
                'message' => 'Employé modifié avec succès',
                'data' => DB::table('users')->where('id', $id)->first()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete employee
     */
    public function destroy($id)
    {
        try {
            // Delete from Supabase auth
            $this->deleteSupabaseUser($id);

            // Delete from database (cascade will handle relations)
            DB::table('users')->where('id', $id)->delete();

            return response()->json([
                'message' => 'Employé supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut_compte' => ['required', Rule::in(['actif', 'inactif', 'suspendu'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('users')
                ->where('id', $id)
                ->update([
                    'statut_compte' => $request->statut_compte,
                    'updated_at' => now()
                ]);

            return response()->json([
                'message' => 'Statut modifié avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper methods for Supabase integration
     */
    private function createSupabaseUser($email, $password)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseServiceKey = env('SUPABASE_SERVICE_KEY');

        try {
            $response = \Illuminate\Support\Facades\Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => "Bearer {$supabaseServiceKey}",
                'Content-Type' => 'application/json',
            ])->post("{$supabaseUrl}/auth/v1/admin/users", [
                'email' => $email,
                'password' => $password,
                'email_confirm' => true,
            ]);

            if (!$response->successful()) {
                throw new \Exception('Erreur Supabase: ' . $response->body());
            }

            $userData = $response->json();
            return $userData['id'];

        } catch (\Exception $e) {
            throw new \Exception('Impossible de créer l\'utilisateur dans Supabase: ' . $e->getMessage());
        }
    }

    private function updateSupabasePassword($userId, $password)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseServiceKey = env('SUPABASE_SERVICE_KEY');

        try {
            $response = \Illuminate\Support\Facades\Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => "Bearer {$supabaseServiceKey}",
                'Content-Type' => 'application/json',
            ])->put("{$supabaseUrl}/auth/v1/admin/users/{$userId}", [
                'password' => $password,
            ]);

            if (!$response->successful()) {
                throw new \Exception('Erreur Supabase: ' . $response->body());
            }

        } catch (\Exception $e) {
            \Log::warning('Failed to update Supabase password: ' . $e->getMessage());
        }
    }

    private function deleteSupabaseUser($userId)
    {
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseServiceKey = env('SUPABASE_SERVICE_KEY');

        try {
            $response = \Illuminate\Support\Facades\Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'apikey' => $supabaseServiceKey,
                'Authorization' => "Bearer {$supabaseServiceKey}",
            ])->delete("{$supabaseUrl}/auth/v1/admin/users/{$userId}");

            if (!$response->successful()) {
                throw new \Exception('Erreur Supabase: ' . $response->body());
            }

        } catch (\Exception $e) {
            \Log::warning('Failed to delete Supabase user: ' . $e->getMessage());
        }
    }
}