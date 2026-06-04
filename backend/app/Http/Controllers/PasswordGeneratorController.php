<?php

namespace App\Http\Controllers;

use App\Models\PolitiqueSecurite;

class PasswordGeneratorController extends Controller
{
    public function generate()
    {
        $politique = PolitiqueSecurite::first();

        if (!$politique) {
            $longueur = 12;
            $complexite = true;
        } else {
            $longueur = $politique->longueurMinimale;
            $complexite = $politique->complexiteRequise;
        }

        $caracteres = 'abcdefghijklmnopqrstuvwxyz';

        if ($complexite) {
            $caracteres .=
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            $caracteres .=
                '0123456789';

            $caracteres .=
                '!@#$%^&*';
        }

        $motDePasse = '';

        for ($i = 0; $i < $longueur; $i++) {

            $motDePasse .=
                $caracteres[
                    random_int(
                        0,
                        strlen($caracteres) - 1
                    )
                ];
        }

        return response()->json([
            'mot_de_passe' => $motDePasse
        ]);
    }
}