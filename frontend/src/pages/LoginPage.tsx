import { useState } from 'react';
import { Utensils, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { authService, UserRole, AuthUser } from '../services/authService';

interface LoginPageProps {
  onLogin: (role: UserRole, user?: AuthUser) => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user, role } = await authService.login(email, password);
      
      // Success - call parent handler
      onLogin(role, user);
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-6 text-[#5E4B3C]" onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <Card className="p-10 shadow-2xl border-0 rounded-3xl bg-white">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl text-[#000000] mb-3">Bon retour !</h2>
            <p className="text-[#5E4B3C]">Connecte-toi à ton espace Mon Miam Miam</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@universite.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#cfbd97] text-white rounded-2xl shadow-lg text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-[#5E4B3C]">Pas encore de compte ? </span>
            <button onClick={() => onNavigate('signup')} className="text-[#cfbd97] hover:underline">
              S'inscrire
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
