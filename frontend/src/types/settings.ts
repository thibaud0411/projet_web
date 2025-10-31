import { LucideIcon } from 'lucide-react';

export interface GeneralSettings {
  nom_restaurant: string;
  primary_color: string;
  secondary_color: string;
  frais_livraison: string | number;
  montant_min_livraison: string | number;
}

export interface LoyaltySettings {
  taux_conversion_points: string | number;
  points_pour_reduction: string | number;
  valeur_reduction: string | number;
  points_parrainage: string | number;
  duree_validite_points: string | number;
}

export interface Horaire {
  id?: number;
  jour: string;
  ouverture_midi: string;
  fermeture_midi: string;
  ouverture_soir: string;
  fermeture_soir: string;
  est_ferme: boolean;
}

export interface Setting {
  cle: string;
  valeur: string;
}

export interface SettingsResponse {
  settings: Setting[];
}

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SettingsFormProps {
  settings: GeneralSettings | LoyaltySettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange?: (name: string, value: string) => void;
  loading: boolean;
}

export interface HorairesFormProps {
  horaires: Horaire[];
  onHoraireChange: (index: number, field: keyof Horaire, value: string | boolean) => void;
  onSave: () => void;
  loading: boolean;
}

export interface SettingsState {
  general: GeneralSettings;
  loyalty: LoyaltySettings;
  horaires: Horaire[];
  loading: boolean;
  saving: boolean;
  activeTab: string;
}
