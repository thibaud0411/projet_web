# Fix CORS - Alternative (Développement uniquement)

Si les autres solutions ne fonctionnent pas, modifiez temporairement le fichier `config/cors.php` :

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],  // ⚠️ ACCEPTE TOUTES LES ORIGINES (dev uniquement!)
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

**⚠️ ATTENTION :** Ceci est UNIQUEMENT pour le développement local. En production, utilisez la configuration sécurisée avec des origines spécifiques.

## Vérification que CORS fonctionne

Dans la console du navigateur (F12), exécutez :

```javascript
fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@monmiammiam.com',
    password: 'Admin123!'
  })
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

Si vous voyez un résultat (même une erreur 401), CORS fonctionne !
