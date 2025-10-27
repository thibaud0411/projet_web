<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;
    
    protected $table = 'promotion';
    protected $primaryKey = 'id_promotion';
    
    // Gère 'date_creation' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = null;

    protected $fillable = [
        'titre',
        'description',
        'reduction',
        'montant_reduction',
        'date_debut',
        'date_fin',
        'image_url',
        'active',
        'code_promo',
        'nombre_utilisations',
        'limite_utilisations',
    ];

    /**
     * Les attributs qui doivent être castés dans des types natifs.
     * Utile pour que Laravel gère les dates comme des objets (Carbon).
     */
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'active' => 'boolean',
    ];
}