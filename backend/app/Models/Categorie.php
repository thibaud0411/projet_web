<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    use HasFactory;
    
    protected $table = 'categorie';
    protected $primaryKey = 'id_categorie';

    // Gère 'date_creation' mais pas 'updated_at'
    public $timestamps = true;
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = null;

    protected $fillable = [
        'nom_categorie',
        'description',
        'ordre_affichage',
        'active',
    ];

    /**
     * Une Categorie PEUT AVOIR plusieurs Articles.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'id_categorie', 'id_categorie');
    }
}