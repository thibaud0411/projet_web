<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commentaire extends Model
{
    use HasFactory;

    protected $table = 'commentaire';
    protected $primaryKey = 'id_commentaire';

    // Gère 'date_commentaire' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_commentaire';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_commande',
        'contenu',
        'note',
        'est_visible',
    ];

    /**
     * Un Commentaire APPARTIENT A une Commande.
     */
    public function commande(): BelongsTo
    {
        return $this->belongsTo(Commande::class, 'id_commande', 'id_commande');
    }
}