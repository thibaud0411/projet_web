import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Importer le Layout
import { ManagerLayout } from '../components/layout/ManagerLayout';

// Importer les pages de l'espace Gérant
import { GeneralStatsPage } from '../pages/manager/GeneralStatsPage';
import { ClaimsValidationPage } from '../pages/manager/ClaimsValidationPage';
import { EmployeeCreatePage } from '../pages/manager/EmployeeCreatePage';
import { OrdersPage } from '../pages/manager/OrdersPage';
// Importer la page 404
import { NotFoundPage } from '../pages/NotFoundPage';



// Configuration du routeur
const router = createBrowserRouter([
  {
    // 1. Redirection de la racine "/" vers "/manager"
    path: '/',
    element: <Navigate to="/manager" replace />,
  },
  {
    // 2. Route principale pour l'espace Gérant (utilise le layout)
    path: '/manager',
    element: <ManagerLayout />,
    errorElement: <NotFoundPage />, // Gère les erreurs de cette section
    children: [
      {
        // 3. Page par défaut pour "/manager"
        // C'est ici que GeneralStatsPage est définie comme page par défaut
        index: true,
        element: <GeneralStatsPage />,
      },
      // 5. Routes pour les autres liens de la maquette
      {
        path: 'orders',
        element: <OrdersPage />,
      },
   
      // (Vos autres pages Gérant)
      {
        path: 'claims',
        element: <ClaimsValidationPage />,
      },
      {
        path: 'create-employee',
        element: <EmployeeCreatePage />,
      },
    ],
  },
  {
    // 6. Route "Catch-all" pour toutes les URL non trouvées
    path: '*',
    element: <NotFoundPage />,
  },
]);

// Composant qui fournit le routeur à l'application
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};