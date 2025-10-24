<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // api: __DIR__.'/../routes/api.php',  // Disabled - using web routes
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
        
        // Enable CORS for ALL requests (including errors)
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        
        // Use custom CSRF middleware to exclude API routes
        $middleware->validateCsrfTokens(except: [
            '/login',
            '/register',
            '/logout',
            '/articles*',
            '/categories-list*',
            '/promotions*',
            '/evenements*',
            '/commandes*',
            '/commentaires*',
            '/user',
            '/admin/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Add CORS headers to all exception responses
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response) {
            $origin = request()->header('Origin');
            $allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
            
            if (in_array($origin, $allowedOrigins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Methods', 'http://localhost:5173');
                $response->headers->set('Access-Control-Allow-Headers', 'http://localhost:5173');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
            
            return $response;
        });
        
        // Return JSON for authentication errors instead of redirects
        $exceptions->shouldRenderJsonWhen(function ($request, \Throwable $e) {
            // Always return JSON for these routes
            if ($request->is('login') || $request->is('register') || $request->is('logout')) {
                return true;
            }
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
    })->create();
