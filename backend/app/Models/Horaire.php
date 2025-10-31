<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horaire extends Model
{
    use HasFactory;

    protected $table = 'horaire';
    protected $primaryKey = 'id_horaire';
    
    public $timestamps = false;

    protected $fillable = [
        'jour_semaine',
        'heure_ouverture',
        'heure_fermeture',
        'est_ferme',
    ];

    protected $casts = [
        'est_ferme' => 'boolean',
    ];
}
