<?php

namespace App\Http\Controllers\Api;
use App\Models\Employe;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Utilisateur;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    /**
     * LIRE: Renvoie la liste de tous les employés actifs.
     * (GET /api/employees)
     */
    public function index()
    {
        // Renvoie les employés actifs avec leur relation utilisateur (parfait pour React)
        $employes = Employe::with('utilisateur')
                            ->where('est_actif', true)
                            ->get();

        return response()->json($employes);
    }

    /**
     * CRÉER: Crée un nouvel employé (et l'utilisateur associé).
     * (POST /api/employees)
     */
    public function store(Request $request)
    {
        // Validation (Mise à jour pour inclure 'prenom')
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255', // <<<--- MODIFIÉ ICI (décommenté et requis)
            'email' => 'required|email|unique:utilisateur,email',
            'phone' => 'required|string|max:20', 
            'password' => 'required|string|min:6', 
        ]);

        $roleEmploye = Role::where('nom_role', 'Employe')->firstOrFail();

        // Création Utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'], // <<<--- MODIFIÉ ICI (on utilise la donnée validée)
            'email' => $data['email'],
            'telephone' => $data['phone'], // Mappage correct (phone -> telephone)
            'mot_de_passe' => Hash::make($data['password']), // Mappage correct (password -> mot_de_passe)
            'id_role' => $roleEmploye->id_role,
        ]);

        // Création Employe
        $employe = Employe::create([
            'id_utilisateur' => $utilisateur->id_utilisateur,
            'poste' => 'Employe',
            'date_embauche' => now(),
            'est_actif' => true,
        ]);

        // Recharge la relation pour la renvoyer au frontend (très bonne pratique)
        $employe->load('utilisateur');

        return response()->json($employe, 201);
    }

    /**
     * SUPPRIMER: "Supprime" un employé (en le marquant inactif).
     * (DELETE /api/employees/{id})
     */
    public function destroy(string $id)
    {
        // Le $id reçu est id_employe, ce qui est correct
        $employe = Employe::findOrFail($id);
        $employe->update(['est_actif' => false]);


        return response()->json(null, 204); // Réponse standard
    }

    // Les méthodes show() et update() sont vides par défaut avec --api
    public function show(string $id) {}
    public function update(Request $request, string $id) {}
}