<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Services\ActivityLogService;
use App\Services\CoffrePersonnelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegisterVerificationCodeMail;
use App\Mail\ResetPasswordCodeMail;
use Carbon\Carbon;

class AuthController extends Controller
{
    private const REGISTRATION_CODE_MINUTES = 10;

    private function generateRegistrationCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function sendRegistrationVerificationCode(string $email, string $code): bool
    {
        try {
            Mail::to($email)->send(new RegisterVerificationCodeMail($code));

            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to send registration verification email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function registrationCodeResponse(string $email, string $message, int $status = 200)
    {
        return response()->json([
            'message' => $message,
            'email' => $email,
        ], $status);
    }

    private function registrationIsExpired(object $pending): bool
    {
        return Carbon::parse($pending->updated_at ?? $pending->created_at)
            ->addMinutes(self::REGISTRATION_CODE_MINUTES)
            ->isPast();
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:8',
        ]);

        $code = $this->generateRegistrationCode();

        DB::table('registration_verifications')->updateOrInsert(
            ['email' => $request->email],
            [
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'code' => $code,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        if (!$this->sendRegistrationVerificationCode($request->email, $code)) {
            return response()->json([
                'message' => 'Impossible d\'envoyer l\'email de vérification. Réessayez plus tard.',
            ], 500);
        }

        return $this->registrationCodeResponse(
            $request->email,
            'Un code de vérification a été envoyé à votre adresse email.'
        );
    }

    public function verifyRegistration(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $pending = DB::table('registration_verifications')
            ->where('email', $request->email)
            ->first();

        if (!$pending) {
            return response()->json([
                'message' => 'Aucune inscription en attente pour cet email.',
                'error' => 'not_found',
            ], 404);
        }

        if ($this->registrationIsExpired($pending)) {
            return response()->json([
                'message' => 'Ce code a expiré. Cliquez sur Renvoyer le code pour en recevoir un nouveau.',
                'error' => 'expired',
            ], 422);
        }

        if ($pending->code !== $request->code) {
            return response()->json([
                'message' => 'Code incorrect. Veuillez réessayer.',
                'error' => 'incorrect',
            ], 422);
        }

        if (Utilisateur::where('email', $request->email)->exists()) {
            DB::table('registration_verifications')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'Un compte existe déjà avec cet email.',
            ], 422);
        }

        $user = Utilisateur::create([
            'username' => $pending->username,
            'email' => $pending->email,
            'password' => $pending->password,
            'role' => 'utilisateur',
        ]);

        CoffrePersonnelService::ensureForUser($user);
        DB::table('registration_verifications')->where('email', $request->email)->delete();

        ActivityLogService::record(
            $user->email,
            ActivityLogService::ACTION_ACCOUNT_VERIFIED,
            ActivityLogService::TYPE_AUTH
        );

        return response()->json([
            'message' => 'Votre compte a été créé avec succès. Vous pouvez vous connecter.',
        ]);
    }

    public function resendRegistrationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $pending = DB::table('registration_verifications')
            ->where('email', $request->email)
            ->first();

        if (!$pending) {
            return response()->json([
                'message' => 'Aucune inscription en attente pour cet email.',
            ], 404);
        }

        if (Utilisateur::where('email', $request->email)->exists()) {
            DB::table('registration_verifications')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'Un compte existe déjà avec cet email.',
            ], 422);
        }

        $code = $this->generateRegistrationCode();

        DB::table('registration_verifications')
            ->where('email', $request->email)
            ->update([
                'code' => $code,
                'updated_at' => now(),
            ]);

        if (!$this->sendRegistrationVerificationCode($request->email, $code)) {
            return response()->json([
                'message' => 'Impossible d\'envoyer l\'email de vérification. Réessayez plus tard.',
            ], 500);
        }

        return $this->registrationCodeResponse(
            $request->email,
            'Un nouveau code de vérification a été envoyé.'
        );
    }
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email','password' => 'required|string',
        ]);
        
        $user = Utilisateur::where('email', $request->email)->first();

       
        if (!$user || !Hash::check($request->password, $user->password)) {
            ActivityLogService::record(
                $request->email,
                ActivityLogService::ACTION_LOGIN_FAILED,
                ActivityLogService::TYPE_WARNING
            );

            return response()->json([
                'message' => 'Identifiants invalides',
            ], 401);
        }

        CoffrePersonnelService::ensureForUser($user);

        ActivityLogService::record(
            $user->email,
            ActivityLogService::ACTION_LOGIN_SUCCESS,
            ActivityLogService::TYPE_AUTH
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function adminLogin(Request $request)
    {
        return $this->login($request);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Cette adresse email est invalide ou n\'existe pas.'], 422);
        }

        $code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

        \Illuminate\Support\Facades\DB::table('password_reset_codes')->updateOrInsert(
            ['email' => $request->email],
            [
                'code' => $code,
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($user->email)->send(new ResetPasswordCodeMail($code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send reset code email', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Impossible d\'envoyer l\'email pour le moment. Réessayez plus tard.',
            ], 500);
        }

        return response()->json([
            'message' => 'Un code de vérification vous a été envoyé.',
        ]);
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $resetCode = \Illuminate\Support\Facades\DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$resetCode) {
            return response()->json(['message' => 'Code de vérification invalide ou expiré.'], 422);
        }

        if (\Carbon\Carbon::parse($resetCode->created_at)->addMinutes(15)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_codes')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Le code de vérification a expiré.'], 422);
        }

        return response()->json(['message' => 'Code vérifié avec succès.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8',
        ]);

        $resetCode = \Illuminate\Support\Facades\DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$resetCode || \Carbon\Carbon::parse($resetCode->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['message' => 'Code de vérification invalide ou expiré.'], 422);
        }

        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_codes')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
