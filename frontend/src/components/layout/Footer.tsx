// src/components/layout/Footer.tsx
import React from 'react';
import './Footer.css'; // Assurez-vous que ce fichier existe

export const Footer: React.FC = () => {
  return (
    <footer className="manager-footer"> {/* Réutilise la classe */}
      © {new Date().getFullYear()} Mon Miam Miam - Espace Employé. Tous droits réservés.
    </footer>
  );
};