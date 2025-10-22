<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids, HasApiTokens;

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'role',
        'statut_compte',
        'points_fidelite',
        'code_parrainage',
        'id_parrain',
        'localisation',
        'consentement_cookies',
        'date_consentement_cookies',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_consentement_cookies' => 'datetime',
            'consentement_cookies' => 'boolean',
            'points_fidelite' => 'integer',
        ];
    }

    /**
     * Get the full name of the user.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Get the parrain (sponsor) of the user.
     */
    public function parrain()
    {
        return $this->belongsTo(User::class, 'id_parrain');
    }

    /**
     * Get the filleuls (sponsored users) of the user.
     */
    public function filleuls()
    {
        return $this->hasMany(User::class, 'id_parrain');
    }
}
