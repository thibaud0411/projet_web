import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// --- Importer TOUS les Layouts ---
import { ManagerLayout } from '../components/layout/ManagerLayout';
import { EmployeeLayout } from '../components/layout/EmployeeLayout';

// --- Importer les nouvelles pages/composants d'authentification ---
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';

// --- Importer les pages Gérant ---
import { GeneralStatsPage } from '../pages/manager/GeneralStatsPage';
import { ClaimsValidationPage } from '../pages/manager/ClaimsValidationPage';
import { EmployeeCreatePage } from '../pages/manager/EmployeeCreatePage';
import { OrdersPage } from '../pages/manager/OrdersPage';

// --- Importer les pages Employé ---
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { EmployeeMenuPage } from '../pages/employee/EmployeeMenuPage';
import { EmployeeOrdersPage } from '../pages/employee/EmployeeOrdersPage';
import { EmployeeClaimsPage } from '../pages/employee/EmployeeClaimsPage';
import { EmployeeStatsPage } from '../pages/employee/EmployeeStatsPage';

// --- Importer la page 404 ---
import { NotFoundPage } from '../pages/NotFoundPage';

// Configuration du routeur
const router = createBrowserRouter([
  // --- Routes Publiques ---
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  
  // --- Routes Protégées ---
  {
    element: <ProtectedRoute />, // Le "gardien"
    children: [
      {
        path: '/manager',
        element: <ManagerLayout />,
        children: [
          { index: true, element: <GeneralStatsPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'claims', element: <ClaimsValidationPage /> },
          { path: 'create-employee', element: <EmployeeCreatePage /> },
        ],
      },
      {
        path: '/employee',
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <EmployeeDashboard /> },
          { path: 'menu', element: <EmployeeMenuPage /> },
          { path: 'orders', element: <EmployeeOrdersPage /> },
          { path: 'claims', element: <EmployeeClaimsPage /> },
          { path: 'stats', element: <EmployeeStatsPage /> },
        ],
      },
    ]
  }
]);

// Composant qui fournit le routeur à l'application
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
