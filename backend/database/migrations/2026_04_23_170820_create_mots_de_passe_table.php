<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mots_de_passes', function (Blueprint $table) {

            $table->id();

            // appartient à un coffre
            $table->foreignId('coffre_id')
                  ->constrained('coffres')
                  ->onDelete('cascade');

            // catégorie optionnelle
            $table->foreignId('categorie_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete();

            // informations du compte
            $table->string('site');

            $table->string('login');

            // mot de passe chiffré
            $table->text('mot_de_passe_chiffre');

            // optionnel
            $table->string('url')
                  ->nullable();

            $table->text('note')
                  ->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mots_de_passes');
    }
};