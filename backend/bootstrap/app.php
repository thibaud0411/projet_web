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
        // C'était déjà correct
        $middleware->api(append: [
       // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();