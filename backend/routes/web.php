<?php

use Illuminate\Support\Facades\Route;
// N'importez plus EmployeeController ici

Route::get('/', function () {
    return view('welcome');
});

// Le groupe Route::prefix('api')->... a été SUPPRIMÉ d'ici.