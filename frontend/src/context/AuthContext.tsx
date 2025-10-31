import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient, { initSanctum } from '../apiClient';
import { Navigate } from 'react-router-dom';

// --- DÉBUT MODIFICATION ---
// Type pour le Rôle (doit correspondre à la DB)
interface Role {
  id_role: number;
  nom_role: 'Gerant' | 'Employe' | 'Etudiant' | 'Administrateur';
  description: string | null;
}

// Type pour l'utilisateur (maintenant avec le rôle)
interface User {
  id_utilisateur: number; // Correspond à votre modèle
  nom: string;
  prenom: string;
  email: string;
  role: Role; // Attend l'objet Rôle imbriqué
  // ... autres champs
}
// --- FIN MODIFICATION ---

// Type pour le contexte
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>; // <<< MODIFIÉ: Renvoie l'utilisateur
  logout: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DÉBUT DE LA CORRECTION (Hook useAuth) ---
// Voici la définition complète et correcte du hook useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
// --- FIN DE LA CORRECTION ---


// Composant "Fournisseur"
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Tente de récupérer l'utilisateur (qui inclut le rôle grâce à notre modif Laravel)
        const response = await apiClient.get<User>('/user'); // Attend le type User
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Fonction de Connexion (Modifiée pour renvoyer l'utilisateur)
  const login = async (email: string, password: string): Promise<User> => {
    try {
      // 1. Initialise le cookie CSRF (Sanctum)
      await initSanctum();
      
      // 2. Tente de se connecter (POST /login)
      await apiClient.post('/login', { email, password });

      // 3. Récupère les infos de l'utilisateur connecté (GET /user)
      const response = await apiClient.get<User>('/user');
      setUser(response.data);
      return response.data; // <<<--- RENVOIE L'UTILISATEUR

    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  // Fonction de Déconnexion (Inchangée)
  const logout = async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setUser(null);
    }
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};