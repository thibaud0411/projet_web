<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participation extends Model
{
    use HasFactory;

    protected $table = 'participation';
    protected $primaryKey = 'id_participation';
    
    // Gère 'date_participation' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_participation';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_utilisateur',
        'id_evenement',
        'points_gagnes',
        'score',
        'a_gagne',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'a_gagne' => 'boolean',
    ];

    /**
     * Une Participation APPARTIENT A un Utilisateur.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Une Participation APPARTIENT A un Evenement.
     */
    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class, 'id_evenement', 'id_evenement');
    }
}