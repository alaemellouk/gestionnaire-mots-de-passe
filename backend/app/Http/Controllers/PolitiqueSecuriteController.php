<?php

namespace App\Http\Controllers;

use App\Models\PolitiqueSecurite;
use App\Services\ActivityLogService;
use App\Services\SecurityPolicyService;
use Illuminate\Http\Request;

class PolitiqueSecuriteController extends Controller
{
    public function show()
    {
        $politique = PolitiqueSecurite::first();

        if (!$politique) {
            return response()->json(SecurityPolicyService::resolvedRules(null));
        }

        return response()->json(array_merge(
            $politique->toArray(),
            SecurityPolicyService::resolvedRules($politique)
        ));
    }

    public function update(Request $request)
    {
        $request->validate([
            'longueurMinimale' => 'required|integer|min:8|max:128',
            'complexiteRequise' => 'required|boolean',
            'dureeValiditeJours' => 'required|integer|min:0|max:365',
            'exiger_majuscules' => 'sometimes|boolean',
            'exiger_minuscules' => 'sometimes|boolean',
            'exiger_chiffres' => 'sometimes|boolean',
            'exiger_caracteres_speciaux' => 'sometimes|boolean',
        ]);

        $payload = [
            'longueurMinimale' => (int) $request->longueurMinimale,
            'complexiteRequise' => (bool) $request->complexiteRequise,
            'dureeValiditeJours' => (int) $request->dureeValiditeJours,
            'exiger_majuscules' => (bool) ($request->exiger_majuscules ?? $request->complexiteRequise),
            'exiger_minuscules' => (bool) ($request->exiger_minuscules ?? $request->complexiteRequise),
            'exiger_chiffres' => (bool) ($request->exiger_chiffres ?? $request->complexiteRequise),
            'exiger_caracteres_speciaux' => (bool) ($request->exiger_caracteres_speciaux ?? $request->complexiteRequise),
        ];

        $politique = PolitiqueSecurite::first();

        if (!$politique) {
            $politique = PolitiqueSecurite::create($payload);
        } else {
            $politique->update($payload);
        }

        ActivityLogService::record(
            $request->user()->email,
            ActivityLogService::ACTION_POLICY_UPDATED,
            ActivityLogService::TYPE_ADMIN
        );

        return response()->json([
            'message' => 'Politique de sécurité mise à jour avec succès',
            'data' => $politique->fresh(),
        ]);
    }
}
