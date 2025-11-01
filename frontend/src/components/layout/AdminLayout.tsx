import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
import DemoModeBanner from '../DemoModeBanner';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  ShoppingCart, 
  Tag, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const AdminLayout = () => {
  // const { user, logout, isAdmin } = useAuth(); // AuthContext supprimé
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock user for demo
  const user = { prenom: 'Demo', nom: 'User', role: 'administrateur' };
  const isAdmin = true;
  const logout = () => console.log('Logout disabled');

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Employés', href: '/admin/employees', icon: Users, adminOnly: true },
    { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Promotions', href: '/admin/promotions', icon: Tag },
    { name: 'Événements', href: '/admin/events', icon: Calendar },
    { name: 'Réclamations', href: '/admin/complaints', icon: MessageSquare },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <DemoModeBanner />
      
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-secondary text-white md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-secondary text-white w-64 md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Mon Miam Miam</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = currentPath === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary/20 text-white' 
                      : 'text-gray-300 hover:bg-primary/10 hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</p>
                  <p className="text-xs text-gray-400">{user?.role || 'Rôle'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
