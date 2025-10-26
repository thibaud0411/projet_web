<?php

return [
    // ... autres configurations
    'paths' => ['api/*', 'sanctum/csrf-cookie'],


    'allowed_origins' => [
        'http://localhost:5174',  
        'http://127.0.0.1:8000', 
    ], 

    // ... autres configurations
    'allowed_methods' => ['*'], 
    'allowed_headers' => ['*'], 
    'supports_credentials' => true,
    // ...
];
