<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PolitiqueSecurite extends Model
{
    protected $table = 'politique_securites';

    protected $fillable = [
        'longueurMinimale',
        'complexiteRequise',
        'exiger_majuscules',
        'exiger_minuscules',
        'exiger_chiffres',
        'exiger_caracteres_speciaux',
        'dureeValiditeJours',
    ];

    protected $casts = [
        'complexiteRequise' => 'boolean',
        'exiger_majuscules' => 'boolean',
        'exiger_minuscules' => 'boolean',
        'exiger_chiffres' => 'boolean',
        'exiger_caracteres_speciaux' => 'boolean',
    ];
}