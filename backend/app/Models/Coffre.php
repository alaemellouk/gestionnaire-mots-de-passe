<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coffre extends Model
{
    protected $table = 'coffres';

    protected $fillable = [
        'utilisateur_id',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function categories()
    {
        return $this->hasMany(Categorie::class, 'coffre_id');
    }

    public function motsDePasse()
    {
        return $this->hasMany(MotDePasse::class, 'coffre_id');
    }
}