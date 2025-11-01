<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reclamation extends Model
{
    use HasFactory;

    protected $table = 'reclamation';
    protected $primaryKey = 'id_reclamation';
    
    // Gère les timestamps personnalisés
    const CREATED_AT = 'date_reclamation';
    const UPDATED_AT = 'date_traitement';

    protected $fillable = [
        'id_utilisateur',
        'id_commande',
        'id_employe_traitement',
        'description',
        'statut',
        'reponse',
        'priorite',
    ];

    /**
     * Une Reclamation APPARTIENT A un Utilisateur (le client).
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Une Reclamation APPARTIENT A une Commande.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }

    /**
     * Une Reclamation EST TRAITEE PAR un Employe.
     */
    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe_traitement', 'id_employe');
    }
}