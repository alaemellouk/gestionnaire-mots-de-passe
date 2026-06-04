<?php

namespace App\Services;

use App\Models\PolitiqueSecurite;
use Carbon\Carbon;

class SecurityPolicyService
{
    public static function getActive(): ?PolitiqueSecurite
    {
        return PolitiqueSecurite::first();
    }

    public static function resolvedRules(?PolitiqueSecurite $politique = null): array
    {
        $politique ??= self::getActive();

        if (!$politique) {
            return [
                'longueurMinimale' => 12,
                'exiger_majuscules' => true,
                'exiger_minuscules' => true,
                'exiger_chiffres' => true,
                'exiger_caracteres_speciaux' => true,
                'dureeValiditeJours' => 0,
            ];
        }

        $complexite = (bool) $politique->complexiteRequise;

        return [
            'longueurMinimale' => max(8, min(128, (int) $politique->longueurMinimale)),
            'exiger_majuscules' => (bool) ($politique->exiger_majuscules ?? $complexite),
            'exiger_minuscules' => (bool) ($politique->exiger_minuscules ?? $complexite),
            'exiger_chiffres' => (bool) ($politique->exiger_chiffres ?? $complexite),
            'exiger_caracteres_speciaux' => (bool) ($politique->exiger_caracteres_speciaux ?? $complexite),
            'dureeValiditeJours' => max(0, (int) $politique->dureeValiditeJours),
        ];
    }

    public static function validateVaultPassword(string $password, ?PolitiqueSecurite $politique = null): array
    {
        $rules = self::resolvedRules($politique);
        $errors = [];

        if (mb_strlen($password) < $rules['longueurMinimale']) {
            $errors[] = "Longueur minimale : {$rules['longueurMinimale']} caractères requis";
        }

        if ($rules['exiger_majuscules'] && !preg_match('/[A-Z]/u', $password)) {
            $errors[] = 'Au moins une lettre majuscule requise';
        }

        if ($rules['exiger_minuscules'] && !preg_match('/[a-z]/u', $password)) {
            $errors[] = 'Au moins une lettre minuscule requise';
        }

        if ($rules['exiger_chiffres'] && !preg_match('/[0-9]/', $password)) {
            $errors[] = 'Au moins un chiffre requis';
        }

        if ($rules['exiger_caracteres_speciaux'] && !preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'Au moins un caractère spécial requis';
        }

        return $errors;
    }

    public static function computeExpiryDate(?PolitiqueSecurite $politique = null): ?Carbon
    {
        $days = self::resolvedRules($politique)['dureeValiditeJours'];

        if ($days <= 0) {
            return null;
        }

        return Carbon::today()->addDays($days);
    }
}
