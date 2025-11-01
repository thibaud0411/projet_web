<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Parrainage extends Model
{
    use HasFactory;
    
    protected $table = 'parrainage';
    protected $primaryKey = 'id_parrainage';
    
    // Gère les timestamps personnalisés
    const CREATED_AT = 'date_parrainage';
    const UPDATED_AT = 'date_recompense';

    protected $fillable = [
        'id_parrain',
        'id_filleul',
        'recompense_attribuee',
        'points_gagnes',
    ];

    /**
     * Le Parrainage APPARTIENT A un Utilisateur (le parrain).
     */
    public function parrain(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_parrain', 'id_utilisateur');
    }

    /**
     * Le Parrainage APPARTIENT A un Utilisateur (le filleul).
     */
    public function filleul(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_filleul', 'id_utilisateur');
    }
}