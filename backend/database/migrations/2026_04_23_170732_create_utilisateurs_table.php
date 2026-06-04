<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {

            $table->id();

            // informations de base
            $table->string('username');

            $table->string('email')
                  ->unique();

            // mot de passe de connexion
            $table->string('password');

            // utilisateur ou administrateur
            $table->enum('role', [
                'utilisateur',
                'administrateur'
            ])->default('utilisateur');

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};