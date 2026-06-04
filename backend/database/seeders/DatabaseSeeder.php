<?php

namespace Database\Seeders;

use App\Services\DefaultAdminService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Délègue au même bootstrap que la commande passguard:bootstrap (sans API).
     */
    public function run(): void
    {
        DefaultAdminService::ensureExists();
    }
}
