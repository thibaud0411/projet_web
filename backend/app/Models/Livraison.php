<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Livraison extends Model
{
    use HasFactory;
    
    protected $table = 'livraison';
    protected $primaryKey = 'id_livraison';
    
    // Gère les timestamps personnalisés
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = 'date_modification';

    protected $fillable = [
        'id_commande',
        'adresse_livraison',
        'heure_livraison',
        'statut_livraison',
        'latitude',
        'longitude',
        'instructions_livraison',
        'id_livreur',
    ];

    /**
     * Une Livraison APPARTIENT A une Commande.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }
}