export interface Category {
  id: number | string | null;
  nom: string;
}

export interface Product {
  id: number | string | null;
  nom: string;
  description: string;
  prix: number;
  id_categorie: number | string | null;
  temps_preparation?: string;
  allergenes?: string;
  calories?: string;
  est_disponible: boolean;
  est_plat_du_jour: boolean;
  image_url?: string;
}

export interface ProductFormData {
  nom: string;
  description: string;
  prix: string | number;
  id_categorie: string | number;
  temps_preparation: string;
  allergenes: string;
  calories: string;
  est_disponible: boolean;
  est_plat_du_jour: boolean;
  image_url: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
