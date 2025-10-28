// src/routes/AppRouter.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Importer le Layout principal
import { EmployeeLayout } from '../components/layout/EmployeeLayout';

// Importer les pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { EmployeeMenuPage } from '../pages/employee/EmployeeMenuPage';
import { EmployeeOrdersPage } from '../pages/employee/EmployeeOrdersPage';
import { EmployeeClaimsPage } from '../pages/employee/EmployeeClaimsPage';
import { EmployeeStatsPage } from '../pages/employee/EmployeeStatsPage';

// Définition du routeur
const router = createBrowserRouter([
  {
    path: '/',
    // Redirige la racine vers le dashboard employé par défaut
    element: <Navigate to="/employee" replace />,
  },
  {
    path: '/employee',
    element: <EmployeeLayout />, // Le layout entoure toutes les pages employées
    children: [
      {
        index: true, // Correspond à /employee
        element: <EmployeeDashboard />,
      },
      {
        path: 'menu', // Correspond à /employee/menu
        element: <EmployeeMenuPage />,
      },
      {
        path: 'orders', // Correspond à /employee/orders
        element: <EmployeeOrdersPage />,
      },
      {
        path: 'claims', // Correspond à /employee/claims
        element: <EmployeeClaimsPage />,
      },
      {
        path: 'stats', // Correspond à /employee/stats
        element: <EmployeeStatsPage />,
      },
    ],
  },
  // Vous pouvez ajouter d'autres routes ici (ex: /login, /manager, etc.)
  // {
  //   path: '/login',
  //   element: <LoginPage />
  // }
]);

// Composant qui fournit le routeur à l'application
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};