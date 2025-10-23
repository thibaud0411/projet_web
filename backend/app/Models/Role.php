<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    /** Le nom de la table */
    protected $table = 'role';

    /** La clé primaire */
    protected $primaryKey = 'id_role';

    /** Désactive les timestamps 'created_at' et 'updated_at' par défaut */
    public $timestamps = false;

    /**
     * Les attributs qui peuvent être assignés en masse.
     */
    protected $fillable = [
        'nom_role',
        'description',
    ];

    /**
     * Un Rôle PEUT APPARTENIR A plusieurs Utilisateurs.
     */
    public function utilisateurs(): HasMany
    {
        return $this->hasMany(Utilisateur::class, 'id_role', 'id_role');
    }
}