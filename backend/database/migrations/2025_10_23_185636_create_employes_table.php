<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employe', function (Blueprint $table) {
            $table->id('id_employe');
            $table->foreignId('id_utilisateur')->unique()->constrained('utilisateur', 'id_utilisateur')->onDelete('cascade');
            $table->string('poste');
            $table->date('date_embauche');
            $table->decimal('salaire', 10, 2)->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamp('date_creation')->useCurrent();
        });
    }
    public function down(): void { Schema::dropIfExists('employe'); }
};