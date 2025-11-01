<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Statistique extends Model
{
    use HasFactory;

    protected $table = 'statistique';
    protected $primaryKey = 'id_statistique';
    
    // Gère 'derniere_mise_a_jour' mais pas 'created_at'
    public $timestamps = true;
    const CREATED_AT = null; 
    const UPDATED_AT = 'derniere_mise_a_jour';

    protected $fillable = [
        'id_utilisateur',
        'total_commandes',
        'total_depense',
        'total_points_gagnes',
        'total_points_utilises',
        'total_parrainages',
        'note_moyenne',
    ];

    /**
     * Une Statistique APPARTIENT A un Utilisateur.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}