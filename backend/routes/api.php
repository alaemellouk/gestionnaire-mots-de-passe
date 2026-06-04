<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CoffreController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MotDePasseController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PolitiqueSecuriteController;
use App\Http\Controllers\PasswordGeneratorController;


/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);

Route::post('/register/verify', [AuthController::class, 'verifyRegistration']);

Route::post('/register/resend', [AuthController::class, 'resendRegistrationCode']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/admin/login', [AuthController::class, 'adminLogin']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);

Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get(
    '/password-generator',
    [PasswordGeneratorController::class, 'generate']
);


/*
|--------------------------------------------------------------------------
| Routes protégées
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/security-policy', [PolitiqueSecuriteController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Coffre personnel (coffre + catégories / mots de passe : même logique pour tous les rôles)
    |--------------------------------------------------------------------------
    */

    Route::middleware('vault.personnel')->group(function () {

        Route::get('/coffre', [CoffreController::class, 'show']);

        Route::get('/coffre/stats', [CoffreController::class, 'stats']);

        Route::post('/coffre/search', [CoffreController::class, 'search']);

        Route::get('/categories', [CategoryController::class, 'index']);

        Route::post('/categories', [CategoryController::class, 'store']);

        Route::put('/categories/{id}', [CategoryController::class, 'update']);

        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::get('/passwords', [MotDePasseController::class, 'index']);

        Route::post('/passwords', [MotDePasseController::class, 'store']);

        Route::get('/passwords/{id}', [MotDePasseController::class, 'show']);

        Route::put('/passwords/{id}', [MotDePasseController::class, 'update']);

        Route::delete('/passwords/{id}', [MotDePasseController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/users', [AdminController::class, 'index']);

    Route::post('/admin/users', [AdminController::class, 'store']);

    Route::put('/admin/users/{id}', [AdminController::class, 'update']);

    Route::delete('/admin/users/{id}', [AdminController::class, 'destroy']);

    Route::get('/admin/logs', [ActivityLogController::class, 'index']);


    /*
    |--------------------------------------------------------------------------
    | Politique sécurité
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/security-policy',
        [PolitiqueSecuriteController::class, 'show']
    );

    Route::put(
        '/admin/security-policy',
        [PolitiqueSecuriteController::class, 'update']
    );


});