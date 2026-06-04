<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotDePasse extends Model
{
    protected $table = 'mots_de_passes';

    protected $fillable = [
        'site',
        'login',
        'mot_de_passe_chiffre',
        'url',
        'note',
        'date_expiration',
        'coffre_id',
        'categorie_id',
    ];

    protected $casts = [
        'date_expiration' => 'date',
    ];

    public function coffre()
    {
        return $this->belongsTo(Coffre::class, 'coffre_id');
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }
}