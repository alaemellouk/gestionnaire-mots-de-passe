<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table = 'utilisateurs';
    protected $fillable = [
        'username','email','password','role','status', 
    ];
    protected $hidden = [
        'password','remember_token',
    ];
    public function coffre()
    {
        return $this->hasOne(Coffre::class, 'utilisateur_id');
    }

    public function isAdmin()
    {
        return $this->role === 'administrateur';
    }
}