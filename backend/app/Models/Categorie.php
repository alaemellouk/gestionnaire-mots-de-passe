<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Categorie extends Model
{
    protected $table = 'categories';
    protected $fillable = [
        'nom',
        'coffre_id',
    ];
    public function coffre()
    {
        return $this->belongsTo(Coffre::class, 'coffre_id');
    }
 public function motsDePasse()
    {
        return $this->hasMany(MotDePasse::class, 'categorie_id');
    }
}