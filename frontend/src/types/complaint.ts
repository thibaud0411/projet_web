import { LucideIcon } from 'lucide-react';

export type ComplaintStatus = 'en_attente' | 'en_cours' | 'resolue' | 'rejetee';
export type ComplaintPriority = 'basse' | 'moyenne' | 'haute' | 'urgente';

export interface Complaint {
  id: number;
  sujet: string;
  description: string;
  priorite: ComplaintPriority;
  statut: ComplaintStatus;
  client_id: number;
  client_nom: string;
  client_prenom: string;
  client_email: string;
  client_telephone?: string;
  numero_commande?: string;
  reponse?: string;
  date_reponse?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
  iconColor: string;
}

export interface PriorityConfig {
  label: string;
  color: string;
}

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
