<?php

namespace App\Console\Commands;

use App\Services\DefaultAdminService;
use Illuminate\Console\Command;

/**
 * Bootstrap initial : crée l'administrateur par défaut si aucun n'existe.
 * Ne passe pas par l'API HTTP (inscription / admin REST).
 */
class PassGuardBootstrapCommand extends Command
{
    protected $signature = 'passguard:bootstrap';

    protected $description = 'Crée le compte administrateur par défaut (coffre + catégories) s\'il n\'existe pas encore';

    public function handle(): int
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('utilisateurs')) {
            $this->error('Table utilisateurs absente. Exécutez d\'abord : php artisan migrate');

            return self::FAILURE;
        }

        $before = \App\Models\Utilisateur::where('role', 'administrateur')->exists();

        $admin = DefaultAdminService::ensureExists();

        if ($admin === null) {
            $this->error('Impossible de créer l\'administrateur.');

            return self::FAILURE;
        }

        if ($before) {
            $this->info('Un administrateur existe déjà — aucune création.');
            $this->line("  E-mail : {$admin->email}");

            return self::SUCCESS;
        }

        $this->info('Administrateur créé (bootstrap, sans API).');
        $this->table(
            ['Champ', 'Valeur'],
            [
                ['Utilisateur', DefaultAdminService::USERNAME],
                ['E-mail', DefaultAdminService::EMAIL],
                ['Mot de passe', DefaultAdminService::PASSWORD],
                ['Rôle', 'administrateur'],
            ]
        );
        $this->warn('Changez ce mot de passe après la première connexion.');

        return self::SUCCESS;
    }
}
