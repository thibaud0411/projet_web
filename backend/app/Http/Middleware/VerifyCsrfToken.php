<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Les URIs qui sont exclues de la vérification CSRF.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*', // <-- autorise toutes les routes API à ne pas nécessiter CSRF
    ];
}
