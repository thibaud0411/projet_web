import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, ChefHat } from 'lucide-react';

interface SignUpFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  localisation: string;
  password: string;
  password_confirmation: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    localisation: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register?.(formData);
      navigate('/admin');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(key => {
          apiErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Une erreur est survenue' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4b896' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full shadow-2xl">
              <ChefHat className="w-12 h-12 text-neutral-900" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-amber-100 mb-4">
                Mon Miam Miam
              </h1>
              <p className="text-xl text-amber-100/80 leading-relaxed">
                Rejoignez notre communauté gourmande
              </p>
              <p className="text-amber-100/60 mt-4">
                Découvrez des saveurs uniques et partagez vos moments culinaires
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="flex justify-center gap-4 mt-8">
              <div className="w-16 h-1 bg-amber-200/30 rounded-full"></div>
              <div className="w-16 h-1 bg-amber-200/50 rounded-full"></div>
              <div className="w-16 h-1 bg-amber-200/30 rounded-full"></div>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/90 rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-sm">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-900 rounded-full mb-3">
                <ChefHat className="w-8 h-8 text-amber-100" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Mon Miam Miam</h2>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Créer un compte
              </h2>
              <p className="text-neutral-700">
                Commencez votre aventure culinaire
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                        errors.prenom ? 'border-red-400' : 'border-neutral-300'
                      }`}
                      placeholder="Jean"
                    />
                  </div>
                  {errors.prenom && (
                    <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                        errors.nom ? 'border-red-400' : 'border-neutral-300'
                      }`}
                      placeholder="Dupont"
                    />
                  </div>
                  {errors.nom && (
                    <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                      errors.email ? 'border-red-400' : 'border-neutral-300'
                    }`}
                    placeholder="jean.dupont@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                        errors.telephone ? 'border-red-400' : 'border-neutral-300'
                      }`}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  {errors.telephone && (
                    <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Ville
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type="text"
                      name="localisation"
                      value={formData.localisation}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                      placeholder="Paris"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-11 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                        errors.password ? 'border-red-400' : 'border-neutral-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Confirmer *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-11 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all ${
                        errors.password_confirmation ? 'border-red-400' : 'border-neutral-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-amber-100 font-bold rounded-xl hover:from-neutral-800 hover:to-neutral-700 focus:outline-none focus:ring-4 focus:ring-neutral-900/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-amber-100/30 border-t-amber-100 rounded-full animate-spin" />
                    Inscription en cours...
                  </span>
                ) : (
                  'Créer mon compte'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-neutral-700">
                  Déjà un compte ?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-neutral-900 hover:text-neutral-700 underline underline-offset-2"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
