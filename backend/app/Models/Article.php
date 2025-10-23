<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    use HasFactory;

    protected $table = 'article';
    protected $primaryKey = 'id_article';

    // Gère les timestamps personnalisés
    const CREATED_AT = 'date_creation';
    const UPDATED_AT = 'date_modification';

    protected $fillable = [
        'nom',
        'description',
        'prix',
        'id_categorie',
        'disponible',
        'image_url',
        'est_promotion',
        'stock_disponible',
    ];

    /**
     * Un Article APPARTIENT A une Categorie.
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }
}