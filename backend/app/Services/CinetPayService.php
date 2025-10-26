<?php

namespace App\Services;

use App\Models\Commande;
use Illuminate\Support\Facades\Log;

/**
 * Simule la communication avec l'API CinetPay pour les paiements Mobile Money (OM, MoMo).
 * Les méthodes simulent les appels nécessaires pour initier le paiement et gérer les callbacks.
 */
class CinetPayService
{
    // Clé de l'API CinetPay (simulée)
    private const API_KEY = 'VOTRE_CLE_API_CINETPAY';
    private const SITE_ID = 'VOTRE_SITE_ID';
    
    /**
     * Simule l'appel à l'API CinetPay pour obtenir une URL de paiement.
     * * @param Commande $commande
     * @param string $notifyUrl URL que CinetPay doit appeler après le paiement.
     * @param string $returnUrl URL où l'utilisateur est redirigé après le paiement.
     * @return string L'URL de redirection ou une chaîne vide en cas d'échec.
     */
    public function generatePaymentLink(Commande $commande, string $notifyUrl, string $returnUrl): string
    {
        Log::info("Tentative de génération du lien CinetPay pour la commande #{$commande->id_commande} (Montant: {$commande->montant_total}).");

        // Dans un cas réel, ici, vous feriez un appel POST à l'endpoint /api-v1/payment/checkout/cpm-api de CinetPay.
        
        // Les données envoyées incluraient :
        /*
        $data = [
            'apikey' => self::API_KEY,
            'site_id' => self::SITE_ID,
            'transaction_id' => $commande->id_commande . '_' . time(),
            'amount' => $commande->montant_total,
            'currency' => 'XOF',
            'notify_url' => $notifyUrl,
            'return_url' => $returnUrl,
            'metadata' => json_encode(['id_commande' => $commande->id_commande]),
            // ... autres champs requis ...
        ];
        */

        // --- SIMULATION ---
        $transactionId = $commande->id_commande . '_' . time();
        
        // Si le montant est supérieur à 50000, on simule une erreur de plafond
        if ($commande->montant_total > 50000) {
             Log::error("CinetPay Simulation: Montant trop élevé pour le test (>$50000).");
             return '';
        }

        // URL de paiement simulée contenant les informations essentielles pour le suivi
        $simulatedPaymentUrl = 'https://simulated-cinetpay.com/checkout?token=' . base64_encode($transactionId) . 
                               '&amount=' . $commande->montant_total;

        Log::info("Lien de paiement généré: {$simulatedPaymentUrl}");
        
        // Mettre à jour la commande pour stocker l'ID de transaction externe si nécessaire
        // $commande->update(['external_transaction_id' => $transactionId]); 

        return $simulatedPaymentUrl;
    }

    /**
     * Simule la vérification du statut de la transaction auprès de CinetPay (appelée par le Webhook).
     *
     * @param int $commandeId L'ID de la commande interne à vérifier.
     * @param array $cinetpayData Les données reçues dans le callback (simulées ici).
     * @return bool Vrai si le paiement est confirmé, faux sinon.
     */
    public function checkStatusAndFinalize(Commande $commande, array $cinetpayData): bool
    {
        // Dans un cas réel, ici, vous feriez un appel POST à l'endpoint /api-v1/payment/check pour
        // vérifier l'état final de la transaction en utilisant $cinetpayData['cpm_site_id'] et $cinetpayData['cpm_trans_id'].

        // --- SIMULATION DU STATUT DE PAIEMENT ---

        $status_key = $cinetpayData['cpm_result'] ?? null;
        
        if ($status_key === '00') { // Code 00 = Succès CinetPay
            // Vérifications cruciales:
            // 1. S'assurer que le montant payé correspond au montant de la commande ($cinetpayData['cpm_amount'])
            // 2. S'assurer que la commande est toujours 'en_attente_paiement'
            
            if ($commande->statut !== 'en_attente_paiement') {
                Log::warning("Callback CinetPay: Commande #{$commande->id_commande} déjà traitée ou annulée. Statut actuel: {$commande->statut}.");
                return false; // Éviter le double traitement
            }

            // Paiement confirmé, mise à jour du statut
            $commande->update([
                'statut' => 'payee',
                'date_paiement' => now(),
                'date_modification' => now(),
            ]);

            Log::info("Callback CinetPay: Paiement confirmé et commande #{$commande->id_commande} mise à jour à 'payee'.");
            return true;
            
        } else if ($status_key === '11') { // Code 11 = Transaction échouée
            $commande->update(['statut' => 'echec_paiement']);
            Log::error("Callback CinetPay: Échec du paiement pour la commande #{$commande->id_commande}. Code CinetPay: {$status_key}.");
            
            // Logique de déblocage du stock omise ici, mais essentielle.
            
            return false;
        }

        // Statut inconnu ou en attente
        Log::warning("Callback CinetPay: Statut de transaction inconnu pour #{$commande->id_commande}. Code: {$status_key}.");
        return false;
    }
}
