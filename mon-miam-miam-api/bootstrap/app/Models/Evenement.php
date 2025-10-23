<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenement';
    protected $primaryKey = 'id_evenement';

    // Gère 'date_creation' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = null;

    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'type_evenement',
        'image_url',
        'recompense_points',
        'nombre_participants_max',
        'est_actif',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'est_actif' => 'boolean',
    ];

    /**
     * Un Evenement PEUT AVOIR plusieurs Participations.
     */
    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class, 'id_evenement', 'id_evenement');
    }
}