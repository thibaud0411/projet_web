import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import { ContactPage } from './pages/ContactPage';
import { authService, UserRole, AuthUser } from './services/authService';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  time: string;
  items: string[];
  total: number;
  status: 'delivered' | 'pending';
  points: number;
}
// import { EmployeeDashboard } from './components/EmployeeDashboard';
// import { AdminDashboard } from './components/AdminDashboard';
// import { GerantDashboard } from './components/GerantDashboard'; // à venir

type Page =
  | 'home'
  | 'menu'
  | 'checkout'
  | 'login'
  | 'signup'
  | 'student'
  | 'employee'
  | 'admin'
  | 'gerant'
  | 'contact'; // Ajouté contact ici pour la navigation

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // --- Load persistent auth on mount ---
  useEffect(() => {
    const loadPersistedAuth = () => {
      const auth = authService.loadAuth();
      
      if (auth && auth.isAuthenticated) {
        setUserRole(auth.role);
        setCurrentUser(auth.user);
        
        // Navigate to appropriate dashboard
        switch (auth.role) {
          case 'student':
            setCurrentPage('student');
            break;
          case 'employee':
            setCurrentPage('employee');
            break;
          case 'admin':
            setCurrentPage('admin');
            break;
          case 'gerant':
            setCurrentPage('gerant');
            break;
          default:
            setCurrentPage('home');
        }
      }
      
      setIsLoading(false);
    };

    loadPersistedAuth();
  }, []);

  // --- Login handler ---
  const handleLogin = (role: UserRole, user?: AuthUser) => {
    console.log('Login successful, role:', role);
    console.log('User data:', user);
    
    // Vérifier que le token est bien dans le localStorage
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token ? 'Found' : 'Not found');
    
    setUserRole(role);
    if (user) {
      console.log('Setting current user:', user);
      setCurrentUser(user);
    }
    
    // Rediriger vers la page appropriée
    switch (role) {
      case 'student':
        console.log('Redirecting to student dashboard');
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
  const handleLogout = async () => {
    await authService.logout();
    setUserRole('guest');
    setCurrentUser(null);
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
        return (
          <CheckoutPage 
            onNavigate={secureNavigate} 
            userRole={userRole} 
            cart={cart}
            setCart={setCart}
            setOrderHistory={setOrderHistory}
            currentUser={currentUser}
          />
        );
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'student':
        return (
          <StudentDashboard 
            onLogout={handleLogout} 
            onNavigate={setCurrentPage} 
            cart={cart}
            setCart={setCart}
          />
        );
      case 'contact':
        return <ContactPage onNavigate={secureNavigate} userRole={userRole} />;

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

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#cfbd97] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5E4B3C] text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-[#FAF3E0]">{renderPage()}</div>;
}
