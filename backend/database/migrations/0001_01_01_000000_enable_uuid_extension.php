<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Enable UUID extension for PostgreSQL/Supabase
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    }

    public function down()
    {
        // Don't drop the extension as it might be used by other applications
        // DB::statement('DROP EXTENSION IF EXISTS "uuid-ossp"');
    }
};
