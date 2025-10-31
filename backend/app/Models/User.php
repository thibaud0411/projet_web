<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Les attributs qui sont assignables en masse (mass assignable).
     * IMPORTANT : 'points_balance' est ajouté pour éviter les erreurs 500 lors de la création.
     * Le champ 'password' est également inclus ici.
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'points_balance', // <-- NOUVEAU: Essentiel pour la création dans AuthController
    ];

    /**
     * Les attributs qui devraient être cachés pour la sérialisation.
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Les attributs qui devraient être castés.
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
