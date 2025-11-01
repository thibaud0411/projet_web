import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LandingPage.css'; // On garde ce style

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({}); // 'any' pour gérer les erreurs API

  // --- DÉBUT BLOC CORRIGÉ ---
  // Gère la redirection si on arrive sur /login en étant DÉJÀ connecté
  if (authLoading) {
     return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (user) {
    // On vérifie le NOM du rôle dans l'OBJET rôle
    const roleName = user.role?.nom_role; 
    
    if (roleName === 'Gerant' || roleName === 'Administrateur') {
      return <Navigate to="/manager" replace />;
    }
    if (roleName === 'Employe') {
      return <Navigate to="/employee" replace />;
    }
    // Gérer 'Etudiant' etc.
    return <Navigate to="/" replace />;
  }
  // --- FIN BLOC CORRIGÉ ---

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      // --- DÉBUT BLOC CORRIGÉ ---
      // 1. On appelle login, qui renvoie l'utilisateur (avec l'objet 'role')
      const loggedInUser = await login(formData.email, formData.password);

      // 2. On redirige en fonction du nom du rôle
      const roleName = loggedInUser.role?.nom_role;
      
      if (roleName === 'Gerant' || roleName === 'Administrateur') {
        navigate('/manager');
      } else if (roleName === 'Employe') {
        navigate('/employee');
      } else {
        // Gérer 'Etudiant'
        navigate('/'); // Retour à l'accueil
      }
      // --- FIN BLOC CORRIGÉ ---

    } catch (error: any) {
      console.error('Login error:', error);
      const errorData = error.response?.data;
      
      if (error.response?.status === 422) {
        // Erreurs de validation de Laravel (ex: "email": ["..."])
        setErrors(errorData.errors);
      } else if (errorData && errorData.message) {
        // Erreur générale (ex: "Email ou mot de passe incorrect")
        setErrors({ general: "Email ou mot de passe incorrect." });
      } else {
        setErrors({ general: 'Une erreur de connexion est survenue.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Efface l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
    if (errors.general) {
      setErrors((prev: any) => ({ ...prev, general: undefined }));
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="col-12 col-md-8 col-lg-5 col-xl-4">
        
        <div className="text-center mb-4">
          <h1 className="landing-title" style={{ fontSize: '2.5rem' }}>Mon Miam Miam</h1>
          <p className="landing-subtitle">Panneau d'administration</p>
        </div>

        <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--border-radius-lg)' }}>
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit} noValidate>
              
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="votre.email@domaine.com"
                  />
                  {/* Gère les erreurs de validation de Laravel */}
                  {errors.email && (
                    <div className="invalid-feedback d-block">{errors.email[0]}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-outline-secondary"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password[0]}</div>
                  )}
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" />
                  <label className="form-check-label" htmlFor="remember">
                    Se souvenir de moi
                  </label>
                </div>
                <Link to="#" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                  Mot de passe oublié?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>
          </div>
        </div>
        
        <p className="text-center text-muted mt-4">
          © 2024 ZeDuc@Space. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
