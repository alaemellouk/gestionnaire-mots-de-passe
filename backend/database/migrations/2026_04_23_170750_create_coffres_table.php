<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coffres', function (Blueprint $table) {

            $table->id();

            // relation avec utilisateur
            $table->foreignId('utilisateur_id')
                  ->unique()
                  ->constrained('utilisateurs')
                  ->onDelete('cascade');

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coffres');
    }
};