<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'admin@gmail.com';
$password = 'alae1234';

$user = App\Models\Utilisateur::where('email', $email)->first();
if ($user) {
    echo "Before update: " . $user->updated_at . "\n";
    $user->password = Illuminate\Support\Facades\Hash::make($password);
    $user->save();
    
    $user->refresh();
    echo "After update: " . $user->updated_at . "\n";
    echo "Hash match: " . (Illuminate\Support\Facades\Hash::check($password, $user->password) ? 'true' : 'false') . "\n";
} else {
    echo "User not found\n";
}
