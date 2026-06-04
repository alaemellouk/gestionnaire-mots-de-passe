<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $coffre = $request->user()->coffre;

        $categories = Categorie::query()
            ->where('coffre_id', $coffre->id)
            ->withCount('motsDePasse')
            ->orderBy('nom')
            ->get()
            ->map(fn (Categorie $categorie) => [
                'id' => $categorie->id,
                'nom' => $categorie->nom,
                'name' => $categorie->nom,
                'coffre_id' => $categorie->coffre_id,
                'password_count' => $categorie->mots_de_passe_count,
                'mots_de_passe_count' => $categorie->mots_de_passe_count,
            ]);

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $coffre = $request->user()->coffre;

        $categorie = Categorie::create([
            'nom' => $request->nom,
            'coffre_id' => $coffre->id,
        ]);

        return response()->json([
            'message' => 'Catégorie ajoutée avec succès',
            'categorie' => $categorie,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $coffre = $request->user()->coffre;

        $categorie = Categorie::where('id', $id)
            ->where('coffre_id', $coffre->id)
            ->firstOrFail();

        $categorie->update([
            'nom' => $request->nom,
        ]);

        return response()->json([
            'message' => 'Catégorie modifiée avec succès',
            'categorie' => $categorie,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $coffre = $request->user()->coffre;

        $categorie = Categorie::where('id', $id)
            ->where('coffre_id', $coffre->id)
            ->firstOrFail();

        $categorie->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}