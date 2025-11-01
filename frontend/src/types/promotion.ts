import { ReactNode } from 'react';

export type PromotionType = 'pourcentage' | 'montant_fixe' | 'produit_gratuit' | 'points_bonus';

export interface PromotionFormData {
  titre: string;
  description: string;
  type_promotion: PromotionType;
  valeur: string;
  code_promo: string;
  date_debut: string;
  date_fin: string;
  conditions: string;
  limite_utilisations: string;
  image_affiche: string;
  est_active: boolean;
}

export interface Promotion extends Omit<PromotionFormData, 'valeur'> {
  id: number;
  valeur: string | number;
  nombre_utilisations: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionStatusUpdate {
  promotionId: number;
  active: boolean;
}

export interface PromotionStats {
  active: number;
  upcoming: number;
  expired: number;
  total_uses: number;
}

export interface PromotionUsage {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  used_at: string;
  order_id?: number;
  order_total?: number;
  discount_applied: number;
}

export interface PromotionListResponse {
  data: Promotion[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
