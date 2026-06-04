<?php
namespace App\Http\Controllers;
use App\Models\Categorie;
use App\Models\MotDePasse;
use Illuminate\Http\Request;
class CoffreController extends Controller
{
    public function stats(Request $request)
    {
        $coffre = $request->user()->coffre;

        return response()->json([
            'passwords_count' => MotDePasse::where('coffre_id', $coffre->id)->count(),
            'categories_count' => Categorie::where('coffre_id', $coffre->id)->count(),
        ]);
    }

    public function show(Request $request)
    {
        $coffre = $request->user()
            ->coffre()
            ->with([
                'categories','motsDePasse.categorie'
            ])
            ->first();
         return response()->json($coffre);
    }
    public function search(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string'
        ]);
        $coffre = $request->user()->coffre;
        $resultats = MotDePasse::with('categorie')
            ->where('coffre_id', $coffre->id)
            ->where(function ($query) use ($request) {
                $query->where('site', 'like', '%' . $request->keyword . '%')
                      ->orWhere('login', 'like', '%' . $request->keyword . '%');
                 })
             ->get();
        return response()->json($resultats);
    }
}