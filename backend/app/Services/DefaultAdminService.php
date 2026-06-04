<?php

namespace App\Services;

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

class DefaultAdminService
{
    public const USERNAME = 'admin';

    public const EMAIL = 'admin@gmail.com';

    public const PASSWORD = '12345678';

    public static function ensureExists(): ?Utilisateur
    {
        $existing = Utilisateur::where('role', 'administrateur')->first();
        if ($existing) {
            return $existing;
        }

        $user = Utilisateur::create([
            'username' => self::USERNAME,
            'email' => self::EMAIL,
            'password' => Hash::make(self::PASSWORD),
            'role' => 'administrateur',
            'status' => 'active',
        ]);

        CoffrePersonnelService::ensureForUser($user);

        return $user;
    }
}
