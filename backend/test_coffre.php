<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach(App\Models\Utilisateur::all() as $u) {
    if (!$u->coffre) {
        App\Models\Coffre::create(['utilisateur_id' => $u->id]);
        echo 'Created coffre for ' . $u->email . "\n";
    }
}
