// src/components/utils/formatters.ts

// --- Types ---
type OrderStatus = 'En attente' | 'En préparation' | 'Prête' | 'Livrée' | 'Annulée' | string;
type ClaimStatus = 'Ouverte' | 'En cours' | 'Résolue' | 'Validée' | 'Rejetée' | string;

// --- Fonctions ---

/**
 * Retourne la classe CSS de badge pour un statut de Commande.
 * S'appuie sur les classes définies dans src/index.css (ex: .status-warning)
 */
export const getOrderStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'En attente': return 'status-warning';
    case 'En préparation': return 'status-info';
    case 'Prête': return 'status-success';
    case 'Livrée': return 'status-secondary';
    case 'Annulée': return 'status-danger';
    default: return 'status-secondary';
  }
};

/**
 * Retourne la classe CSS de badge pour un statut de Réclamation.
 */
export const getClaimStatusBadgeClass = (status: ClaimStatus): string => {
  switch (status) {
    case 'Ouverte': return 'status-warning'; // Ou 'status-danger'
    case 'En cours': return 'status-info';
    case 'Résolue': return 'status-success';
    case 'Validée': return 'status-success';
    case 'Rejetée': return 'status-danger';
    default: return 'status-secondary';
  }
};

/**
 * Formate une date ISO en 'JJ/MM/AAAA'.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return 'Date invalide';
  }
};

/**
 * Formate une date ISO en 'HH:MM'.
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Heure invalide';
  }
};

/**
 * Formate un nombre en devise XAF.
 */
export const formatAmount = (amount: number | string | null | undefined): string => {
  const num = Number(amount);
  if (isNaN(num)) return '0 XAF';
  
  // Utilise 'fr-CM' pour le formatage local (Cameroun)
  const formatted = num.toLocaleString('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // .toLocaleString peut ajouter 'XAF' ou 'FCFA'. Si 'XAF' est déjà là, on ne le double pas.
  // Si ce n'est pas le cas, on l'ajoute pour la cohérence (bien que 'fr-CM' devrait gérer 'FCFA').
  // Simplification: le style currency gère le symbole.
  return formatted.replace(/\s/g, ' '); // Assure un espace insécable si besoin
};

/**
 * Calcule le temps écoulé (ex: "il y a 2 heures").
 */
export const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000; // Années
        if (interval > 1) return `il y a ${Math.floor(interval)} an(s)`;
        
        interval = seconds / 2592000; // Mois
        if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
        
        interval = seconds / 86400; // Jours
        if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
        
        interval = seconds / 3600; // Heures
        if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
        
        interval = seconds / 60; // Minutes
        if (interval > 1) return `il y a ${Math.floor(interval)} min`;
        
        return `à l'instant`;
    } catch (e) {
        return 'Date invalide';
    }
};