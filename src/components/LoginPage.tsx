import { useState } from 'react';
import { Utensils, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface LoginPageProps {
  onLogin: (role: 'student' | 'employee' | 'admin' | 'gerant') => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Détection simple du rôle selon l’adresse email
    if (email.includes('admin')) {
      onLogin('admin');
    } else if (email.includes('employee') || email.includes('employe')) {
      onLogin('employee');
    } else if (email.includes('gerant')) {
      onLogin('gerant');
    } else {
      onLogin('student');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          className="mb-6 text-[#5E4B3C] hover:text-[#000000] hover:bg-white/50"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        {/* Carte login */}
        <Card className="p-10 shadow-2xl border-0 rounded-3xl bg-white">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl text-[#000000] mb-3">Bon retour !</h2>
            <p className="text-[#5E4B3C]">
              Connecte-toi à ton espace Mon Miam Miam
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#000000]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@universite.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#000000]">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl shadow-lg text-lg"
            >
              Se connecter
            </Button>
          </form>

          {/* Lien d'inscription */}
          <div className="mt-8 text-center">
            <span className="text-[#5E4B3C]">Pas encore de compte ? </span>
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#cfbd97] hover:underline"
            >
              S'inscrire
            </button>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-[#5E4B3C]">
          <p>En te connectant, tu acceptes nos conditions d'utilisation</p>
        </div>
      </div>
    </div>
  );
}
