<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Auth routes are included in api.php for API authentication
// Do NOT include them here to avoid duplicate routes without CORS
