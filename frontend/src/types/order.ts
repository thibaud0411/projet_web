import { ReactNode } from 'react';

export type OrderStatus = 
  | 'en_attente' 
  | 'confirmee' 
  | 'en_preparation' 
  | 'prete' 
  | 'en_livraison' 
  | 'livree' 
  | 'annulee';

export interface OrderItem {
  id: number;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  commentaire?: string;
}

export interface OrderAddress {
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
}

export interface OrderClient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface Order {
  id: number;
  numero_commande: string;
  statut: OrderStatus;
  type_commande: 'emporter' | 'sur_place' | 'livraison';
  date_commande: string;
  date_livraison?: string;
  montant_total: number;
  frais_livraison: number;
  mode_paiement: string;
  statut_paiement: string;
  client: OrderClient;
  adresse_livraison: OrderAddress;
  adresse_facturation: OrderAddress;
  articles: OrderItem[];
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusOption {
  value: OrderStatus | 'all';
  label: string;
  icon?: ReactNode;
}

export interface OrderStats {
  label: string;
  count: number;
  color: string;
  icon: ReactNode;
}

export interface OrderStatusUpdate {
  orderId: number;
  newStatus: OrderStatus;
}
