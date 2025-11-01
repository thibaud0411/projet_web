<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
// On utilise Authenticatable car c'est notre modèle d'utilisateur principal
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateur';
    protected $primaryKey = 'id_utilisateur';
    
    // Correspondance pour les timestamps personnalisés de votre SQL
    const CREATED_AT = 'date_inscription';
    const UPDATED_AT = 'date_modification';

    /**
     * Les attributs qui peuvent être assignés en masse.
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'telephone',
        'localisation',
        'points_fidelite',
        'code_parrainage',
        'id_parrain',
        'id_role',
        'statut_compte',
        'est_actif',
    ];

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Get the name of the unique identifier for the user.
     */
    public function getAuthIdentifierName()
    {
        return 'id_utilisateur';
    }

    /**
     * Les attributs à cacher lors de la conversion en JSON (ex: réponses API).
     */
    protected $hidden = [
        'mot_de_passe',
        'id_role', // Hide raw role ID
    ];

    /**
     * Les attributs à ajouter lors de la conversion en JSON.
     */
    protected $appends = [
        'id',
    ];

    /**
     * Get the user's ID as 'id' for frontend compatibility.
     */
    public function getIdAttribute(): int
    {
        return $this->id_utilisateur;
    }

    /**
     * Get the user's role name for frontend.
     * This automatically maps id_role to role name.
     */
    public function getRoleNameAttribute(): string
    {
        // Map role IDs to role names
        $roleMap = [
            1 => 'administrateur',
            2 => 'gerant',
            3 => 'employe',
            4 => 'etudiant',
        ];
        
        return $roleMap[$this->id_role] ?? 'etudiant';
    }

    /**
     * Un Utilisateur APPARTIENT A un Rôle.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    /**
     * Un Utilisateur (parrain) PEUT AVOIR plusieurs Parrainages.
     */
    public function parrainages(): HasMany
    {
        return $this->hasMany(Parrainage::class, 'id_parrain', 'id_utilisateur');
    }

    /**
     * Un Utilisateur PEUT AVOIR plusieurs Commandes.
     */
    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Un Utilisateur PEUT AVOIR plusieurs Réclamations.
     */
    public function reclamations(): HasMany
    {
        return $this->hasMany(Reclamation::class, 'id_utilisateur', 'id_utilisateur');
    }
    
    /**
     * Un Utilisateur PEUT AVOIR une fiche Employe (relation 1-1).
     */
    public function employe(): HasOne
    {
        return $this->hasOne(Employe::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Un Utilisateur PEUT AVOIR une fiche Statistique (relation 1-1).
     */
    public function statistique(): HasOne
    {
        return $this->hasOne(Statistique::class, 'id_utilisateur', 'id_utilisateur');
    }
}