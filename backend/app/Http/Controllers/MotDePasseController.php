<?php

namespace App\Http\Controllers;

use App\Models\MotDePasse;
use App\Services\ActivityLogService;
use App\Services\SecurityPolicyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class MotDePasseController extends Controller
{
    private function vaultPasswordFromRequest(Request $request): ?string
    {
        $value = $request->input('mot_de_passe')
            ?? $request->input('password')
            ?? $request->input('motDePasse');

        return is_string($value) ? $value : null;
    }

    private function policyViolationResponse(array $violations)
    {
        return response()->json([
            'message' => 'Ce mot de passe ne respecte pas la politique de sécurité :',
            'policy_violations' => $violations,
            'errors' => $violations,
        ], 422);
    }

    private function encryptedPasswordFields(string $plainPassword): array
    {
        return [
            'mot_de_passe_chiffre' => Crypt::encryptString($plainPassword),
            'date_expiration' => SecurityPolicyService::computeExpiryDate(),
        ];
    }

    public function index(Request $request)
    {
        $coffre = $request->user()->coffre;

        $motsDePasse = MotDePasse::query()
            ->select([
                'id',
                'site',
                'login',
                'url',
                'note',
                'date_expiration',
                'coffre_id',
                'categorie_id',
                'created_at',
                'updated_at',
            ])
            ->with('categorie:id,nom,coffre_id')
            ->where('coffre_id', $coffre->id)
            ->orderByDesc('id')
            ->get();

        return response()->json($motsDePasse);
    }

    public function store(Request $request)
    {
        $request->validate([
            'site' => 'required|string',
            'login' => 'required|string',
            'categorie_id' => 'nullable|exists:categories,id',
            'url' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $plainPassword = $this->vaultPasswordFromRequest($request);

        if ($plainPassword === null || $plainPassword === '') {
            return response()->json([
                'message' => 'Le mot de passe est obligatoire.',
            ], 422);
        }

        $violations = SecurityPolicyService::validateVaultPassword($plainPassword);

        if ($violations !== []) {
            return $this->policyViolationResponse($violations);
        }

        $coffre = $request->user()->coffre;

        $motDePasse = MotDePasse::create([
            'site' => $request->site,
            'login' => $request->login,
            'url' => $request->url,
            'note' => $request->note,
            'coffre_id' => $coffre->id,
            'categorie_id' => $request->categorie_id,
            ...$this->encryptedPasswordFields($plainPassword),
        ]);

        ActivityLogService::record(
            $request->user()->email,
            ActivityLogService::ACTION_PASSWORD_SAVED,
            ActivityLogService::TYPE_USER
        );

        return response()->json([
            'message' => 'Mot de passe ajouté avec succès',
            'data' => $motDePasse,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $coffre = $request->user()->coffre;

        $motDePasse = MotDePasse::where('id', $id)
            ->where('coffre_id', $coffre->id)
            ->firstOrFail();

        $plainPassword = Crypt::decryptString($motDePasse->mot_de_passe_chiffre);

        return response()->json([
            'id' => $motDePasse->id,
            'site' => $motDePasse->site,
            'login' => $motDePasse->login,
            'url' => $motDePasse->url,
            'note' => $motDePasse->note,
            'categorie_id' => $motDePasse->categorie_id,
            'mot_de_passe' => $plainPassword,
            'password' => $plainPassword,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'site' => 'sometimes|string',
            'login' => 'sometimes|string',
            'categorie_id' => 'nullable|exists:categories,id',
            'url' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $coffre = $request->user()->coffre;

        $motDePasse = MotDePasse::where('id', $id)
            ->where('coffre_id', $coffre->id)
            ->firstOrFail();

        $plainPassword = $this->vaultPasswordFromRequest($request);

        if ($plainPassword !== null && $plainPassword !== '') {
            $violations = SecurityPolicyService::validateVaultPassword($plainPassword);

            if ($violations !== []) {
                return $this->policyViolationResponse($violations);
            }
        }

        $data = [
            'site' => $request->input('site', $motDePasse->site),
            'login' => $request->input('login', $motDePasse->login),
            'url' => $request->has('url') ? $request->url : $motDePasse->url,
            'note' => $request->has('note') ? $request->note : $motDePasse->note,
            'categorie_id' => $request->has('categorie_id')
                ? $request->categorie_id
                : $motDePasse->categorie_id,
        ];

        if ($plainPassword !== null && $plainPassword !== '') {
            $data = array_merge($data, $this->encryptedPasswordFields($plainPassword));
        }

        $motDePasse->update($data);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès',
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $coffre = $request->user()->coffre;

        $motDePasse = MotDePasse::where('id', $id)
            ->where('coffre_id', $coffre->id)
            ->firstOrFail();

        $motDePasse->delete();

        ActivityLogService::record(
            $request->user()->email,
            ActivityLogService::ACTION_PASSWORD_DELETED,
            ActivityLogService::TYPE_USER
        );

        return response()->json([
            'message' => 'Mot de passe supprimé avec succès',
        ]);
    }
}
