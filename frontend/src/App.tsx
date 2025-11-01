// src/App.tsx (C'est votre Fichier 2)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
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
        {/* 3. Fournisseur d'authentification */}
        <AuthProvider>

          {/* 4. Définition de toutes les routes de l'application */}
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
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
            
            {/* Rediriger la racine "/" vers login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* 5. Composant pour afficher les notifications (Toasts) */}
          <Toaster position="top-right" />

        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;