<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Mail\AdminPasswordResetMail;
use App\Services\ActivityLogService;
use App\Services\CoffrePersonnelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function index()
    {
        $users = Utilisateur::query()
            ->select(['id', 'username', 'email', 'role', 'status', 'created_at', 'updated_at'])
            ->orderByDesc('id')
            ->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:8',
            'role' => 'sometimes|string|in:utilisateur,administrateur,admin',
            'status' => 'sometimes|string|in:active,disabled',
        ]);

        $role = $request->role ?? 'utilisateur';
        if ($role === 'admin') {
            $role = 'administrateur';
        }

        $user = Utilisateur::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => $request->status ?? 'active',
        ]);

        CoffrePersonnelService::ensureForUser($user);

        ActivityLogService::record(
            $request->user()->email,
            ActivityLogService::ACTION_USER_ADDED,
            ActivityLogService::TYPE_ADMIN
        );

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);

        $request->validate([
            'username' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:utilisateurs,email,' . $id,
            'password' => 'nullable|string|min:8',
            'password_confirmation' => 'nullable|string|min:8',
            'role' => 'sometimes|string|in:utilisateur,administrateur,admin',
            'status' => 'sometimes|string|in:active,disabled',
        ]);

        $password = $request->input('password');
        $passwordConfirmation = $request->input('password_confirmation');
        $wantsPasswordReset = filled($password) || filled($passwordConfirmation);

        if ($wantsPasswordReset) {
            if (!filled($password) || !filled($passwordConfirmation)) {
                return response()->json([
                    'message' => 'Les champs mot de passe et confirmation sont requis pour réinitialiser le mot de passe.',
                    'errors' => [
                        'password' => ['Renseignez le mot de passe et sa confirmation.'],
                    ],
                ], 422);
            }

            if ($password !== $passwordConfirmation) {
                return response()->json([
                    'message' => 'Les mots de passe ne correspondent pas.',
                    'errors' => [
                        'password_confirmation' => ['Les mots de passe ne correspondent pas.'],
                    ],
                ], 422);
            }
        }

        $data = $request->only(['username', 'email', 'status']);

        if ($request->filled('role')) {
            $data['role'] = ($request->role === 'admin') ? 'administrateur' : $request->role;
        }

        if ($wantsPasswordReset) {
            $data['password'] = Hash::make($password);
        }

        $user->update($data);

        if ($wantsPasswordReset) {
            ActivityLogService::passwordResetFor($user->email, $request->user()->email);

            try {
                Mail::to($user->email)->send(new AdminPasswordResetMail());
            } catch (\Throwable $e) {
                Log::error('Failed to send admin password reset notification', [
                    'user_email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Utilisateur modifié avec succès',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);
        $user->delete();

        ActivityLogService::record(
            $request->user()->email,
            ActivityLogService::ACTION_USER_DELETED,
            ActivityLogService::TYPE_ADMIN
        );

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
}