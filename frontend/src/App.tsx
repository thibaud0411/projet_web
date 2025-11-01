// src/App.tsx (C'est votre Fichier 2)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Register from './pages/Register';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Menu from './pages/Menu';
import Orders from './pages/orders';
import Promotions from './pages/promotions';
import Events from './pages/Events';
import Complaints from './pages/Complaints';
import Settings from './pages/Settings';
import Demo from './pages/Demo';
import { LandingPage } from './pages/public/LandingPage';

// Import Manager & Employee layouts and pages
import { ManagerLayout } from './components/layout/ManagerLayout';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { GeneralStatsPage } from './pages/manager/GeneralStatsPage';
import { ClaimsValidationPage } from './pages/manager/ClaimsValidationPage';
import { EmployeeCreatePage } from './pages/manager/EmployeeCreatePage';
import { OrdersPage as ManagerOrdersPage } from './pages/manager/OrdersPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeMenuPage } from './pages/employee/EmployeeMenuPage';
import { EmployeeOrdersPage } from './pages/employee/EmployeeOrdersPage';
import { EmployeeClaimsPage } from './pages/employee/EmployeeClaimsPage';
import { EmployeeStatsPage } from './pages/employee/EmployeeStatsPage';

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// C'est le composant principal de l'application
function App() {
  return (
    // 1. Fournisseur de données (TanStack Query)
    <QueryClientProvider client={queryClient}>
      {/* 2. Fournisseur de routes (Router) */}
      <BrowserRouter>
        {/* 3. AuthProvider supprimé - pas d'authentification */}

          {/* 4. Définition de toutes les routes de l'application */}
          <Routes>
            {/* Routes publiques */}
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/demo" element={<Demo />} />
            
            {/* Routes Admin protégées */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Ces routes s'afficheront à l'intérieur du AdminLayout */}
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="menu" element={<Menu />} />
              <Route path="orders" element={<Orders />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="events" element={<Events />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Routes Manager - Accès libre sans protection */}
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<GeneralStatsPage />} />
              <Route path="orders" element={<ManagerOrdersPage />} />
              <Route path="claims" element={<ClaimsValidationPage />} />
              <Route path="create-employee" element={<EmployeeCreatePage />} />
            </Route>

            {/* Routes Employee - Accès libre sans protection */}
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="menu" element={<EmployeeMenuPage />} />
              <Route path="orders" element={<EmployeeOrdersPage />} />
              <Route path="claims" element={<EmployeeClaimsPage />} />
              <Route path="stats" element={<EmployeeStatsPage />} />
            </Route>
            
            {/* Page d'accueil */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* 5. Composant pour afficher les notifications (Toasts) */}
          <Toaster position="top-right" />

      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;