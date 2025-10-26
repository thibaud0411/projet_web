import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { MenuPage } from './components/MenuPage';
import { CheckoutPage } from './components/CheckoutPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { StudentDashboard } from './components/StudentDashboard';
// import { EmployeeDashboard } from './components/EmployeeDashboard';
// import { AdminDashboard } from './components/AdminDashboard';
// import { GerantDashboard } from './components/GerantDashboard'; // à venir

type UserRole = 'guest' | 'student' | 'employee' | 'admin' | 'gerant';
type Page =
  | 'home'
  | 'menu'
  | 'checkout'
  | 'login'
  | 'signup'
  | 'student'
  | 'employee'
  | 'admin'
  | 'gerant';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userRole, setUserRole] = useState<UserRole>('guest');

  // --- Login handler ---
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    switch (role) {
      case 'student':
        setCurrentPage('student');
        break;
      // case 'employee':
      //   setCurrentPage('employee');
      //   break;
      // case 'admin':
      //   setCurrentPage('admin');
      //   break;
      // case 'gerant':
      //   setCurrentPage('gerant');
      //   break;
      default:
        setCurrentPage('home');
    }
  };

  // --- Logout handler ---
  const handleLogout = () => {
    setUserRole('guest');
    setCurrentPage('home');
  };

  // --- Secure navigation (force login) ---
const secureNavigate = (page: Page) => {
  // Seul "checkout" est protégé, "menu" reste accessible
  if (userRole === 'guest' && page === 'checkout') {
    setCurrentPage('login');
  } else {
    setCurrentPage(page);
  }
};

  // --- Page rendering ---
  const renderPage = () => {
    switch (currentPage) {
      case 'menu':
        return <MenuPage onNavigate={secureNavigate} userRole={userRole} />;
      case 'checkout':
        return <CheckoutPage onNavigate={secureNavigate} userRole={userRole} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'student':
        return <StudentDashboard onLogout={handleLogout} onNavigate={setCurrentPage} />;
      // case 'employee':
      //   return <EmployeeDashboard onLogout={handleLogout} onNavigate={setCurrentPage} />;
      // case 'admin':
      //   return <AdminDashboard onLogout={handleLogout} onNavigate={setCurrentPage} />;
      // case 'gerant':
      //   return <GerantDashboard onLogout={handleLogout} onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={secureNavigate} userRole={userRole} />;
    }
  };

  return <div className="min-h-screen bg-[#FAF3E0]">{renderPage()}</div>;
}