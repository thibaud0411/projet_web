<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employe extends Model
{
    use HasFactory;

    protected $table = 'employe';
    protected $primaryKey = 'id_employe';
    
    // Gère 'date_creation' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = null; 

    protected $fillable = [
        'id_utilisateur',
        'poste',
        'date_embauche',
        'salaire',
        'est_actif',
    ];

    /**
     * Un Employe APPARTIENT A un Utilisateur (relation 1-1).
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}