import { useState } from 'react';
import { Utensils, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface LoginPageProps {
  onLogin: (role: 'student' | 'employee' | 'admin') => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login logic based on email
    if (email.includes('admin')) {
      onLogin('admin');
    } else if (email.includes('employee') || email.includes('employe')) {
      onLogin('employee');
    } else {
      onLogin('student');
    }
  };

  const quickLogin = (role: 'student' | 'employee' | 'admin') => {
    onLogin(role);
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
            <h2 className="text-3xl text-[#000000] mb-3">Bon retour !</h2>
            <p className="text-[#5E4B3C]">
              Connecte-toi à ton espace Mon Miam Miam
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#000000]">Email</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#000000]">Mot de passe</Label>
                <a href="#" className="text-sm text-[#cfbd97] hover:text-[#cfbd97] transition-colors">
                  Oublié ?
                </a>
              </div>
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
              size="lg"
            >
              Se connecter
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#EFD9A7]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#5E4B3C]">
                Connexion rapide (demo)
              </span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-[#cfbd97] text-[#cfbd97] hover:bg-[#cfbd97] hover:text-white transition-all"
              onClick={() => quickLogin('student')}
            >
              <Badge className="mr-2 bg-[#cfbd97]/10 text-[#cfbd97] border-0">
                Étudiant
              </Badge>
              Connexion Étudiant
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-[#8A9A5B] text-[#8A9A5B] hover:bg-[#8A9A5B] hover:text-white transition-all"
              onClick={() => quickLogin('employee')}
            >
              <Badge className="mr-2 bg-[#8A9A5B]/10 text-[#8A9A5B] border-0">
                Employé
              </Badge>
              Connexion Employé
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-[#5E4B3C] text-[#5E4B3C] hover:bg-[#5E4B3C] hover:text-white transition-all"
              onClick={() => quickLogin('admin')}
            >
              <Badge className="mr-2 bg-[#5E4B3C]/10 text-[#5E4B3C] border-0">
                Admin
              </Badge>
              Connexion Admin
            </Button>
          </div>

          {/* Sign Up Link */}
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
