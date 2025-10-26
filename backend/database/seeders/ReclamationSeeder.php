<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Reclamation; // Importe le modèle Reclamation
use App\Models\Utilisateur; // Importe le modèle Utilisateur
use App\Models\Commande;    // Importe le modèle Commande (optionnel)
use App\Models\Role;       // Importe le modèle Role

class ReclamationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- Prérequis : Assure-toi qu'il existe des utilisateurs (étudiants) ---
        // Trouve le rôle 'Etudiant'
        $roleEtudiant = Role::where('nom_role', 'Etudiant')->first();
        if (!$roleEtudiant) {
            $this->command->error("Le rôle 'Etudiant' n'a pas été trouvé. Lancez d'abord le RoleSeeder.");
            return; // Arrête si le rôle n'existe pas
        }

        // Essaie de trouver des utilisateurs avec le rôle Etudiant
        $etudiants = Utilisateur::where('id_role', $roleEtudiant->id_role)->limit(3)->get();

        // S'il n'y a pas assez d'étudiants, on ne peut pas créer de réclamations liées
        if ($etudiants->count() < 1) {
             $this->command->warn("Aucun utilisateur avec le rôle 'Etudiant' trouvé. Impossible de créer des réclamations liées à des utilisateurs.");
            // Optionnel: Créer des utilisateurs étudiants ici si nécessaire ou arrêter.
            // Pour l'instant, on continue sans lier forcément à un étudiant existant.
            // Vous pourriez créer un utilisateur générique ici si besoin.
            // Note: Le code ci-dessous plantera s'il n'y a aucun étudiant.
            // return;
        }

        // Optionnel: Essaie de trouver des commandes existantes
        $commandes = Commande::limit(2)->get();

        // --- Création des Réclamations ---

        // Réclamation 1: Ouverte, sans réponse, liée à un étudiant et une commande (si possible)
        Reclamation::create([
            'id_utilisateur' => $etudiants->get(0) ? $etudiants->get(0)->id_utilisateur : 1, // Prend le premier étudiant trouvé ou ID 1 par défaut
            'id_commande' => $commandes->get(0) ? $commandes->get(0)->id_commande : null, // Prend la première commande ou null
            'description' => 'Le plat principal était froid à la livraison.',
            'statut' => 'Ouverte', // Pour être visible dans les deux composants
            'date_reclamation' => now()->subDays(1), // Hier
            'priorite' => 'Moyenne',
            'reponse' => null, // Pas encore de réponse
        ]);

        // Réclamation 2: En cours, avec réponse, liée à un autre étudiant (si possible)
        Reclamation::create([
            'id_utilisateur' => $etudiants->get(1) ? $etudiants->get(1)->id_utilisateur : 1, // Prend le deuxième étudiant ou ID 1
            'id_commande' => $commandes->get(1) ? $commandes->get(1)->id_commande : null, // Prend la deuxième commande ou null
            'description' => 'Il manquait la boisson dans ma commande.',
            'statut' => 'En cours', // Pour être visible dans ClaimsValidationPage
            'date_reclamation' => now()->subHours(2), // Il y a 2 heures
            'priorite' => 'Haute',
            'reponse' => 'Veuillez nous excuser, un bon de réduction vous sera envoyé.', // Réponse de l'employé
        ]);

        // Réclamation 3: Autre statut (ne sera pas affichée dans vos composants actuels)
        Reclamation::create([
            'id_utilisateur' => $etudiants->get(0) ? $etudiants->get(0)->id_utilisateur : 1, // Lie au premier étudiant
            'id_commande' => null, // Pas forcément liée à une commande
            'description' => 'Suggestion : ajouter plus de plats végétariens.',
            'statut' => 'Résolue', // N'apparaîtra pas dans la page de validation
            'date_reclamation' => now()->subDays(3),
            'date_traitement' => now()->subDays(1),
            'priorite' => 'Basse',
            'reponse' => 'Merci pour votre suggestion, nous la prenons en compte.',
        ]);

        $this->command->info('ReclamationSeeder exécuté avec succès.');
    }
}