<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'commande';
    protected $primaryKey = 'id_commande';

    // Gère les timestamps personnalisés
    const CREATED_AT = 'date_commande';
    const UPDATED_AT = 'date_modification';

    protected $fillable = [
        'id_utilisateur',
        'montant_total',
        'points_gagnes',
        'type_service',
        'heure_arrivee',
        'statut',
        'numero_commande',
    ];

    /**
     * Une Commande APPARTIENT A un Utilisateur.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    /**
     * Une Commande PEUT AVOIR plusieurs Lignes de Commande (articles).
     */
    public function lignes(): HasMany
    {
        return $this->hasMany(LigneCommande::class, 'id_commande', 'id_commande');
    }

    /**
     * Une Commande A UN Paiement (relation 1-1).
     */
    public function paiement(): HasOne
    {
        return $this->hasOne(Paiement::class, 'id_commande', 'id_commande');
    }

    /**
     * Une Commande A UNE Livraison (relation 1-1).
     */
    public function livraison(): HasOne
    {
        return $this->hasOne(Livraison::class, 'id_commande', 'id_commande');
    }

    /**
     * Une Commande PEUT AVOIR plusieurs Commentaires.
     */
    public function commentaires(): HasMany
    {
        return $this->hasMany(Commentaire::class, 'id_commande', 'id_commande');
    }
}