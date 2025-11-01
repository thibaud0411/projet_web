import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { AuthErrors, ForgotPasswordFormData } from '../types/auth';

const ForgotPassword = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [errors, setErrors] = useState<AuthErrors>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: AuthErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/forgot-password', formData);
      setEmailSent(true);
      toast.success('Email de réinitialisation envoyé!');
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error(error.response?.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof AuthErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof AuthErrors];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary rounded-full mb-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mot de passe oublié?</h1>
          <p className="text-gray-600 mt-2">
            {emailSent 
              ? 'Vérifiez votre boîte mail'
              : 'Entrez votre email pour réinitialiser votre mot de passe'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700">
                Un email contenant un lien de réinitialisation a été envoyé à <strong>{formData.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full mt-6">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`
                      block w-full pl-10 pr-3 py-3 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="admin@monmiammiam.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                Envoyer le lien de réinitialisation
              </Button>

              {/* Back to Login */}
              <Link 
                to="/login" 
                className="flex items-center justify-center text-sm text-gray-600 hover:text-primary transition-colors"
                aria-label="Retour à la page de connexion"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © {new Date().getFullYear()} ZeDuc@Space. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
