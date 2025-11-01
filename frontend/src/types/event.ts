import { LucideIcon } from 'lucide-react';

export type EventType = 'jeu' | 'concours' | 'soiree_thematique' | 'match' | 'autre';

export interface Event {
  id: number | null;
  titre: string;
  description: string;
  type_evenement: EventType;
  date_debut: string;
  date_fin: string;
  lieu: string;
  recompenses: string;
  recompense_points?: string;
  limite_participants: string | number | null;
  nombre_participants_max?: number;
  nombre_participants?: number;
  image_affiche: string;
  image_url?: string;
  est_actif: boolean;
  participations?: Participation[];
}

export interface Participation {
  id: number;
  utilisateur_id: number;
  evenement_id: number;
  date_inscription: string;
  statut: 'inscrit' | 'present' | 'absent';
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface EventFormData {
  titre: string;
  description: string;
  type_evenement: EventType;
  date_debut: string;
  date_fin: string;
  lieu: string;
  recompenses: string;
  limite_participants: string | number;
  image_affiche: string;
  est_actif: boolean;
}

export interface EventStatus {
  label: string;
  color: string;
}

export interface EventStats {
  label: string;
  count: number;
  color: string;
}
