<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneCommande extends Model
{
    use HasFactory;

    protected $table = 'ligne_commande';
    protected $primaryKey = 'id_ligne';
    
    // Pas de timestamps sur cette table
    public $timestamps = false; 

    protected $fillable = [
        'id_commande',
        'id_article',
        'quantite',
        'prix_unitaire',
        'sous_total',
        'commentaire_article',
    ];

    /**
     * Une Ligne APPARTIENT A une Commande.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }

    /**
     * Une Ligne concerne UN Article.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'id_article', 'id_article');
    }
}