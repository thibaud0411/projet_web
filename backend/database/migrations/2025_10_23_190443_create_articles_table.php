<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article', function (Blueprint $table) {
            $table->id('id_article');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->foreignId('id_categorie')->constrained('categorie', 'id_categorie')->onDelete('restrict');
            $table->boolean('disponible')->default(true);
            $table->string('image_url')->nullable();
            $table->boolean('est_promotion')->default(false);
            $table->integer('stock_disponible')->default(0);
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article');
    }
};