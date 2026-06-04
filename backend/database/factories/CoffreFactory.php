<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Utilisateur;

class CoffreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'utilisateur_id' => Utilisateur::inRandomOrder()->first()->id,
            'nom' => $this->faker->word(),
        ];
    }
}