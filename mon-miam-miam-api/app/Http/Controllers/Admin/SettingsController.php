<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        try {
            $settings = DB::table('parametres')
                ->select(['id', 'cle', 'valeur', 'type_valeur', 'description'])
                ->get();

            return response()->json($settings);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.cle' => 'required|string',
            'settings.*.valeur' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->settings as $setting) {
                DB::table('parametres')
                    ->updateOrInsert(
                        ['cle' => $setting['cle']],
                        [
                            'valeur' => $setting['valeur'],
                            'updated_at' => now()
                        ]
                    );
            }

            DB::commit();

            return response()->json([
                'message' => 'Paramètres mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get opening hours
     */
    public function horaires()
    {
        try {
            $horaires = DB::table('horaires')
                ->orderByRaw("FIELD(jour_semaine, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')")
                ->get();

            return response()->json($horaires);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des horaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update opening hours
     */
    public function updateHoraires(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'horaires' => 'required|array',
            'horaires.*.id' => 'required|exists:horaires,id',
            'horaires.*.heure_ouverture' => 'required|date_format:H:i:s',
            'horaires.*.heure_fermeture' => 'required|date_format:H:i:s',
            'horaires.*.est_ferme' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->horaires as $horaire) {
                DB::table('horaires')
                    ->where('id', $horaire['id'])
                    ->update([
                        'heure_ouverture' => $horaire['heure_ouverture'],
                        'heure_fermeture' => $horaire['heure_fermeture'],
                        'est_ferme' => $horaire['est_ferme'],
                    ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Horaires mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single setting by key
     */
    public function getSetting($key)
    {
        try {
            $setting = DB::table('parametres')
                ->where('cle', $key)
                ->first();

            if (!$setting) {
                return response()->json([
                    'message' => 'Paramètre non trouvé'
                ], 404);
            }

            return response()->json($setting);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement du paramètre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update single setting
     */
    public function updateSetting(Request $request, $key)
    {
        $validator = Validator::make($request->all(), [
            'valeur' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::table('parametres')
                ->where('cle', $key)
                ->update([
                    'valeur' => $request->valeur,
                    'updated_at' => now()
                ]);

            return response()->json([
                'message' => 'Paramètre mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}