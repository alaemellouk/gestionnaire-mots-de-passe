<?php

namespace Database\Seeders;

use App\Models\Coffre;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class CoffreSeeder extends Seeder
{
    public function run(): void
    {
        $utilisateur = Utilisateur::first();

        Coffre::create([
            'utilisateur_id' => $utilisateur->id,
            'nom' => 'Coffre principal',
        ]);
    }
}