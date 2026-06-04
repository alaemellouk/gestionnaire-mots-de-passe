<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('politique_securites', function (Blueprint $table) {
            $table->boolean('exiger_majuscules')->default(true)->after('complexiteRequise');
            $table->boolean('exiger_minuscules')->default(true)->after('exiger_majuscules');
            $table->boolean('exiger_chiffres')->default(true)->after('exiger_minuscules');
            $table->boolean('exiger_caracteres_speciaux')->default(true)->after('exiger_chiffres');
        });

        Schema::table('mots_de_passes', function (Blueprint $table) {
            $table->date('date_expiration')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('politique_securites', function (Blueprint $table) {
            $table->dropColumn([
                'exiger_majuscules',
                'exiger_minuscules',
                'exiger_chiffres',
                'exiger_caracteres_speciaux',
            ]);
        });

        Schema::table('mots_de_passes', function (Blueprint $table) {
            $table->dropColumn('date_expiration');
        });
    }
};
