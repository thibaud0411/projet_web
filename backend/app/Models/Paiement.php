<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    protected $table = 'paiement';
    protected $primaryKey = 'id_paiement';
    
    // Gère 'date_paiement' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_paiement';
    const UPDATED_AT = null; 

    protected $fillable = [
        'id_commande',
        'montant',
        'methode_paiement',
        'statut_paiement',
        'transaction_id',
        'points_utilises',
        'montant_points',
        'montant_especes',
        'reference_paiement',
    ];

    /**
     * Un Paiement APPARTIENT A une Commande.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }
}