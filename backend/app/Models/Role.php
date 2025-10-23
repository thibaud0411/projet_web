<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    /**
     * Le nom de la table de la base de données associée au modèle.
     */
    protected $table = 'role';

    /**
     * La clé primaire associée à la table.
     */
    protected $primaryKey = 'id_role';

    /**
     * Indique si le modèle doit être horodaté (created_at et updated_at).
     * Mis à 'false' car votre migration n'a qu'un 'date_creation' personnalisé.
     */
    public $timestamps = false;

    /**
     * Les attributs qui peuvent être assignés en masse.
     */
    protected $fillable = [
        'nom_role',
        'description',
    ];

    /**
     * Obtient les utilisateurs associés à ce rôle.
     * Un rôle peut avoir plusieurs utilisateurs.
     */
    public function utilisateurs(): HasMany
    {
        return $this->hasMany(Utilisateur::class, 'id_role', 'id_role');
    }
}