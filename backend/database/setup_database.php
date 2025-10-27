<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

try {
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/../../CREATE_DB.sql');
    
    if (!$sql) {
        throw new Exception('Could not read CREATE_DB.sql file');
    }
    
    echo "Executing database setup...\n";
    
    // Execute the SQL
    DB::unprepared($sql);
    
    echo "Database setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
