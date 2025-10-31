<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Horaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings.
     */
    public function index()
    {
        try {
            $settings = Setting::all();
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'settings' => 'required|array',
                'settings.*.cle' => 'required|string',
                'settings.*.valeur' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->settings as $setting) {
                Setting::updateOrCreate(
                    ['cle' => $setting['cle']],
                    ['valeur' => $setting['valeur']]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Paramètres mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get opening hours.
     */
    public function getHoraires()
    {
        try {
            $horaires = Horaire::orderByRaw("FIELD(jour_semaine, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')")->get();
            
            // If no hours exist, create default ones
            if ($horaires->isEmpty()) {
                $jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
                foreach ($jours as $jour) {
                    $horaires[] = Horaire::create([
                        'jour_semaine' => $jour,
                        'heure_ouverture' => '08:00',
                        'heure_fermeture' => '22:00',
                        'est_ferme' => $jour === 'dimanche'
                    ]);
                }
                $horaires = Horaire::orderByRaw("FIELD(jour_semaine, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')")->get();
            }

            return response()->json($horaires);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des horaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update opening hours.
     */
    public function updateHoraires(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'horaires' => 'required|array',
                'horaires.*.id' => 'required|exists:horaire,id_horaire',
                'horaires.*.heure_ouverture' => 'nullable|date_format:H:i',
                'horaires.*.heure_fermeture' => 'nullable|date_format:H:i',
                'horaires.*.est_ferme' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->horaires as $horaireData) {
                $horaire = Horaire::find($horaireData['id']);
                if ($horaire) {
                    $horaire->update([
                        'heure_ouverture' => $horaireData['heure_ouverture'] ?? $horaire->heure_ouverture,
                        'heure_fermeture' => $horaireData['heure_fermeture'] ?? $horaire->heure_fermeture,
                        'est_ferme' => $horaireData['est_ferme'] ?? $horaire->est_ferme,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Horaires mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des horaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
