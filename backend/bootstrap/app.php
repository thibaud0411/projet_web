<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',

        // --- AJOUTS REQUIS ---
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        // --- FIN DES AJOUTS ---

        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // --- DÉBUT DE LA CORRECTION ---
        // Ajout des middleware nécessaires pour l'authentification SPA de Sanctum
        $middleware->api(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // 'throttle:api', // Vous pouvez décommenter ceci plus tard pour la limitation de requêtes
        ]);
        // --- FIN DE LA CORRECTION ---

        $middleware->web(append: [
            // Vous pouvez ajouter des middleware web ici si nécessaire
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();