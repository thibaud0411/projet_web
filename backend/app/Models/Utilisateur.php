<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
// Si vous utilisez l'authentification Laravel, 'Authenticatable' est meilleur
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Changez 'Model' en 'Authenticatable' si c'est votre modèle d'authentification
class Utilisateur extends Authenticatable // ou Model
{
    use HasFactory, Notifiable;

    protected $table = 'utilisateur';
    protected $primaryKey = 'id_utilisateur';

    // --- DÉBUT DES MODIFICATIONS ---

    /**
     * Indique à Laravel que les timestamps sont activés.
     */
    public $timestamps = true; // C'était 'false'
    

    /**
     * Définit le nom de la colonne "created_at" personnalisée.
     */
    const CREATED_AT = 'date_inscription';

    /**
     * Définit le nom de la colonne "updated_at" personnalisée.
     */
    const UPDATED_AT = 'date_modification';

    // --- FIN DES MODIFICATIONS ---


    /**
     * The attributes that are mass assignable.
     * Met à jour 'fillable' pour correspondre à votre nouvelle migration.
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'telephone',
        'localisation', // Ajouté depuis votre migration
        'points_fidelite', // Ajouté
        'code_parrainage', // Ajouté
        'id_parrain', // Ajouté
        'id_role',
        'statut_compte', // Ajouté
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected $casts = [
        'mot_de_passe' => 'hashed',
        'date_inscription' => 'datetime',
        'derniere_connexion' => 'datetime',
        'date_modification' => 'datetime',
        'statut_compte' => 'boolean',
    ];
    public function getAuthPassword()
    {
        return $this->mot_de_passe; // Doit correspondre à votre colonne DB
    }
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }
}