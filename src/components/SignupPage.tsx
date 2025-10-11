import { useState } from 'react';
import { Utensils, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create the account
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-[#5E4B3C] hover:text-[#000000] hover:bg-white/50"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <Card className="p-10 shadow-2xl border-0 rounded-3xl bg-white">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#cfbd97] to-[#cfbd97] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl text-[#000000] mb-3">Rejoins-nous !</h2>
            <p className="text-[#5E4B3C]">
              Crée ton compte et commence à commander
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[#000000]">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#000000]">Email universitaire</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@universite.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#000000]">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-[#000000]">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E4B3C]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-12 h-14 rounded-2xl border-2 border-[#EFD9A7] focus:border-[#cfbd97] bg-white text-[#000000]"
                  required
                />
              </div>
            </div>

            <div className="bg-[#EFD9A7]/30 rounded-2xl p-5">
              <p className="text-[#5E4B3C] mb-3">
                En créant un compte, tu bénéficies de :
              </p>
              <ul className="space-y-2 text-[#5E4B3C]">
                <li className="flex items-center gap-2">
                  <span className="text-[#8A9A5B]">✓</span> Commande rapide et facile
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8A9A5B]">✓</span> Programme de fidélité
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8A9A5B]">✓</span> Offres exclusives
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8A9A5B]">✓</span> Historique des commandes
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#cfbd97] hover:bg-[#cfbd97] text-white rounded-2xl shadow-lg text-lg"
              size="lg"
            >
              Créer mon compte
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <span className="text-[#5E4B3C]">Déjà un compte ? </span>
            <button
              onClick={() => onNavigate('login')}
              className="text-[#cfbd97] hover:underline"
            >
              Se connecter
            </button>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-[#5E4B3C]">
          <p>En créant un compte, tu acceptes nos conditions d'utilisation et notre politique de confidentialité</p>
        </div>
      </div>
    </div>
  );
}
