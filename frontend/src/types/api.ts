// src/types/api.ts (Vous pourriez créer ce fichier séparément, mais je les inclus ici pour la clarté)

interface Article {
  id_article: number;
  nom: string;
  description: string;
  prix: number; // En FCFA
  id_categorie: number;
  disponible: boolean;
  image_url: string | null;
  est_promotion: boolean;
  stock_disponible: number;
  categorie: Categorie; // Inclure la relation
}

interface Categorie {
    id_categorie: number;
    nom_categorie: string;
    description: string;
}

interface Commande {
    id_commande: number;
    numero_commande: string;
    montant_total: number;
    date_commande: string; // Ou Date
    statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
    points_gagnes: number;
    lignes: LigneCommande[]; // Pour afficher les articles
}

interface LigneCommande {
    id_ligne: number;
    quantite: number;
    prix_unitaire: number;
    article: { nom: string }; // On simplifie pour l'historique
}

interface UtilisateurProfile {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    points_fidelite: number;
    // Autres champs importants
}

interface UtilisateurStatistique {
    total_commandes: number;
    total_depense: number;
}