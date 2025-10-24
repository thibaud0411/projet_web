<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// Correction de la faute de frappe ici : il faut utiliser le namespace complet du Modèle
use App\Models\Employe; // <<<--- CORRIGÉ ICI 
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
        // Maintenant, PHP sait où trouver la classe 'Employe'
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
        // Validation (Vérifiez que les clés correspondent à ce que React envoie : 'phone', 'password')
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            // 'prenom' => 'required|string|max:255', // Décommentez si votre formulaire envoie 'prenom'
            'email' => 'required|email|unique:utilisateur,email',
            'phone' => 'required|string|max:20', // React envoie 'phone'
            'password' => 'required|string|min:6', // React envoie 'password', min 6 ou 8 selon votre choix
        ]);

        $roleEmploye = Role::where('nom_role', 'Employe')->firstOrFail();

        // Création Utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'] ?? '', // Utilise 'prenom' s'il existe, sinon ''
            'email' => $data['email'],
            'telephone' => $data['phone'], // La BDD attend 'telephone'
            'mot_de_passe' => Hash::make($data['password']), // La BDD attend 'mot_de_passe' (mais on crypte 'password' reçu)
            'id_role' => $roleEmploye->id_role,
        ]);

        // Création Employe
        $employe = Employe::create([
            'id_utilisateur' => $utilisateur->id_utilisateur,
            'poste' => 'Employe',
            'date_embauche' => now(),
            'est_actif' => true,
        ]);

        $employe->load('utilisateur');

        return response()->json($employe, 201);
    }

    /**
     * SUPPRIMER: "Supprime" un employé (en le marquant inactif).
     * (DELETE /api/employees/{id})
     */
    public function destroy(string $id)
    {
        $employe = Employe::findOrFail($id);
        $employe->update(['est_actif' => false]);

        // La ligne $employe->save(); est inutile après update()
        // return response()->json(['message' => 'Employé désactivé avec succès.']); // Renvoie un message
        return response()->json(null, 204); // Ou renvoie juste un succès vide (standard REST)
    }

    // Les méthodes show() et update() sont vides par défaut avec --api
    public function show(string $id) {}
    public function update(Request $request, string $id) {}
}