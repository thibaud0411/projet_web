<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index()
    {
        $roles = Role::with('utilisateurs')->get();

        return response()->json($roles);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom_role' => 'required|string|max:50|unique:role,nom_role',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create($request->all());

        return response()->json([
            'message' => 'Rôle créé avec succès',
            'data' => $role
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show($id)
    {
        $role = Role::with('utilisateurs')->find($id);

        if (!$role) {
            return response()->json([
                'message' => 'Rôle non trouvé'
            ], 404);
        }

        return response()->json($role);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'message' => 'Rôle non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom_role' => 'sometimes|string|max:50|unique:role,nom_role,' . $id . ',id_role',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $role->update($request->all());

        return response()->json([
            'message' => 'Rôle mis à jour avec succès',
            'data' => $role
        ]);
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'message' => 'Rôle non trouvé'
            ], 404);
        }

        // Check if role has users
        if ($role->utilisateurs()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un rôle ayant des utilisateurs associés'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'message' => 'Rôle supprimé avec succès'
        ]);
    }
}
