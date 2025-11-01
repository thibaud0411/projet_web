import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MenuPage } from './components/MenuPage';
import { CheckoutPage } from './components/CheckoutPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';

// Simplifié : Seules les pages de visiteur sont gérées
type UserRole = 'guest'; 
type Page = 'home' | 'menu' | 'checkout' | 'login' | 'signup';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  // L'état de l'utilisateur n'est plus nécessaire, mais on le définit en guest par clarté
  const userRole: UserRole = 'guest';

  // NOTE IMPORTANTE : Les fonctions handleLogin et handleLogout sont retirées
  // car elles relèvent du travail de gestion de rôle.

  const renderPage = () => {
    switch (currentPage) {
      case 'menu':
        // On suppose que userRole est toujours 'guest' pour votre travail
        return <MenuPage onNavigate={setCurrentPage} userRole={userRole} />;
      case 'checkout':
        return <CheckoutPage onNavigate={setCurrentPage} userRole={userRole} />;
      case 'login':
        // On simule ici la fonction de connexion. 
        // Votre coéquipier devra remplacer cette fonction 'onLogin' plus tard.
        return <LoginPage 
                   onLogin={() => setCurrentPage('home')} // Fonction factice
                   onNavigate={setCurrentPage} 
                />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {renderPage()}
    </div>
  );
}