import React, { useState } from 'react';
import { Utensils, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import axios from 'axios'; // Import direct de axios pour éviter l'erreur de résolution

// --- Définitions des composants UI pour la compilation en un seul fichier ---

// Composant de Carte simple (similaire à shadcn/ui Card)
const Card: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({ className, children, ...props }) => (
  <div
    className={`p-10 shadow-2xl border-0 rounded-3xl bg-white ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Composant Label simple (similaire à shadcn/ui Label)
const Label: React.FC<React.ComponentPropsWithoutRef<'label'>> = ({ className, children, ...props }) => (
  <label
    className={`block text-sm font-medium text-gray-700 ${className}`}
    {...props}
  >
    {children}
  </label>
);

// Composant Input simple (similaire à shadcn/ui Input)
const Input: React.FC<React.ComponentPropsWithoutRef<'input'>> = ({ className, ...props }) => (
  <input
    className={`peer block w-full rounded-xl border border-gray-300 bg-[#F9F9F9] px-4 py-2 text-sm text-gray-700 placeholder:text-gray-500 transition-colors focus:border-[#cfbd97] focus:ring-2 focus:ring-[#cfbd97]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Composant Button simple (similaire à shadcn/ui Button)
interface CustomButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'ghost' | 'default';
}

const Button: React.FC<CustomButtonProps> = ({ className, children, variant = 'default', ...props }) => {
  let baseClasses = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";
  let variantClasses = "";

  if (variant === 'ghost') {
    variantClasses = 'bg-transparent text-[#5E4B3C] hover:text-[#000000] hover:bg-white/50 px-3 py-2';
  } else {
    variantClasses = 'bg-[#cfbd97] text-white hover:bg-[#b5a383] shadow-lg';
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Fin des définitions des composants UI ---

// Définition des types pour les erreurs de validation
interface ValidationErrors {
  [key: string]: string[];
}

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction utilitaire pour afficher les erreurs spécifiques à un champ
  const getFieldErrors = (fieldName: string) => {
    return validationErrors[fieldName] ? validationErrors[fieldName].join(' ') : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({}); // Réinitialiser les erreurs
    setGeneralError(null);
    setIsSuccess(false);
    setIsLoading(true);

    // Vérification côté client
    if (formData.password !== formData.confirmPassword) {
      setGeneralError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      // Utilisation directe d'axios
      const response = await axios.post('http://localhost:8000/api/register', { // URL complète nécessaire si non configurée globalement
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword, // Le CHAMP CORRIGÉ pour Laravel
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setGeneralError('Compte créé avec succès ! Redirection vers la page de connexion...');
        // Nettoyage du formulaire après succès
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        // Redirection après un petit délai
        setTimeout(() => onNavigate('login'), 1500);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          // Erreur de validation Laravel
          setValidationErrors(error.response.data.errors);
          setGeneralError('Veuillez corriger les erreurs de validation.');
        } else {
          // Autres erreurs (401, 500, etc.)
          setGeneralError(error.response.data.message || `Erreur HTTP ${error.response.status}.`);
        }
      } else {
        // Erreurs réseau (serveur injoignable, etc.)
        setGeneralError('Erreur réseau. Veuillez vérifier que le serveur Laravel est démarré sur http://localhost:8000.');
      }
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour les styles d'Input
  const getInputClasses = (fieldName: string) => `
    pl-12 w-full h-12 ${getFieldErrors(fieldName) ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-[#cfbd97]'} 
  `;

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <Card>
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl text-[#000000] mb-3">Rejoins-nous !</h2>
            <p className="text-[#5E4B3C]">Crée ton compte et commence à commander</p>
          </div>

          {/* Messages de statut/erreur général */}
          {generalError && (
            <div className={`p-3 mb-4 rounded-xl text-sm font-medium ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ Nom */}
            <div className="space-y-3">
              <Label htmlFor="name">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={getInputClasses('name')}
                  required
                />
              </div>
              {getFieldErrors('name') && <p className="text-red-500 text-xs mt-1">{getFieldErrors('name')}</p>}
            </div>

            {/* Champ Email */}
            <div className="space-y-3">
              <Label htmlFor="email">Email universitaire</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@universite.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={getInputClasses('email')}
                  required
                />
              </div>
              {getFieldErrors('email') && <p className="text-red-500 text-xs mt-1">{getFieldErrors('email')}</p>}
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-3">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••• (Min. 8 caractères)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={getInputClasses('password')}
                  required
                />
              </div>
              {/* Affichage des erreurs liées au mot de passe ou à la confirmation */}
              {getFieldErrors('password') && <p className="text-red-500 text-xs mt-1">{getFieldErrors('password')}</p>}
            </div>

            {/* Champ Confirmation du Mot de passe */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Retapez le mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={getInputClasses('confirmPassword')}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </div>
              ) : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-[#5E4B3C]">Déjà un compte ? </span>
            <button onClick={() => onNavigate('login')} className="text-[#cfbd97] hover:underline">
              Se connecter
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
