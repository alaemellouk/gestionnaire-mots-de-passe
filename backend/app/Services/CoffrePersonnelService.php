<?php

namespace App\Services;

use App\Models\Categorie;
use App\Models\Coffre;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\DB;

class CoffrePersonnelService
{
    public const DEFAULT_CATEGORY_NAMES = [
        'Réseaux sociaux',
        'Banque',
        'Email',
    ];

    public static function ensureForUser(Utilisateur $user): Coffre
    {
        return DB::transaction(function () use ($user) {
            $coffre = Coffre::firstOrCreate(
                ['utilisateur_id' => $user->id],
                []
            );

            $user->setRelation('coffre', $coffre);

            if ($coffre->categories()->count() === 0) {
                foreach (self::DEFAULT_CATEGORY_NAMES as $nom) {
                    Categorie::create([
                        'nom' => $nom,
                        'coffre_id' => $coffre->id,
                    ]);
                }
            }

            return $coffre;
        });
    }
}
