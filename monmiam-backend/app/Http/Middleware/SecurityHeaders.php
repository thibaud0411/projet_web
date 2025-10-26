<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Gère la requête entrante.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Traite la requête et obtient la réponse avant de modifier les en-têtes
        $response = $next($request);

        // --- EN-TÊTES DE SÉCURITÉ ---

        // 1. Ajouter l'en-tête 'X-Content-Type-Options: nosniff'
        // Empêche les navigateurs de tenter de deviner le type de contenu de la réponse.
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // 2. S'assurer que le Content-Type utilise utf-8
        // Laravel gère souvent cela par défaut, mais cela garantit l'alignement.
        if ($response->headers->has('Content-Type') && strpos($response->headers->get('Content-Type'), 'charset=') === false) {
             // Si le Content-Type existe mais n'a pas de charset, l'ajoute pour s'assurer que c'est utf-8 (requis par l'analyseur)
             $response->headers->set('Content-Type', $response->headers->get('Content-Type') . '; charset=utf-8');
        }

        // 3. Empêcher l'utilisation de 'eval' (lié à CSP)
        // Bien que Laravel par défaut ne renvoie pas de Content-Security-Policy strict,
        // nous pouvons ajouter un en-tête CSP de base qui bloque 'eval'.
        // ATTENTION: Cela pourrait casser certains outils tiers.
        // Pour les API, nous allons nous concentrer sur les en-têtes principaux.

        // 4. Supprimer l'en-tête 'X-Powered-By' (disallowed header)
        // Cet en-tête n'est généralement pas généré par Laravel lui-même, mais par le serveur web (Apache/Nginx) ou PHP.
        // En PHP, il est supprimé en ajoutant 'expose_php = Off' dans le php.ini.
        // On le supprime ici au cas où il serait ajouté par un niveau inférieur.
        $response->headers->remove('X-Powered-By');


        // --- REMARQUE CONCERNANT LES STYLES ---

        // Les problèmes de compatibilité CSS ('-webkit-text-size-adjust', 'field-sizing')
        // sont gérés côté front-end (React) et ne sont pas modifiables dans le code PHP de l'API.
        // L'outil d'analyse se plaint des styles appliqués dans le code front-end (CSS/React/HTML).


        return $response;
    }
}
