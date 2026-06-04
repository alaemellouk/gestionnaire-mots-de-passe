<?php

namespace Database\Seeders;

use App\Services\DefaultAdminService;
use Illuminate\Database\Seeder;

/** @deprecated Utiliser {@see DatabaseSeeder} */
class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        DefaultAdminService::ensureExists();
    }
}
