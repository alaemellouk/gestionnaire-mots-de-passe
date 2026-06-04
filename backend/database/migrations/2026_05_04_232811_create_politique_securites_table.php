<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('politique_securites', function (Blueprint $table) {

            $table->id();

            $table->integer('longueurMinimale')
                  ->default(12);

            $table->boolean('complexiteRequise')
                  ->default(true);

            $table->integer('dureeValiditeJours')
                  ->default(90);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('politique_securites');
    }
};