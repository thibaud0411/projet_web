import React from 'react';
import './PageHeader.css'; // <<< AJOUTEZ CETTE LIGNE

interface PageHeaderProps {
  title: string;
  subtitle: string;
  // Décommentez actionButton pour l'utiliser
  actionButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actionButton }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
      <div>
        {/* Utilise h1.h2 pour la taille mais garde la sémantique h1 */}
        <h1 className="h2 page-title mb-1">{title}</h1>
        <p className="page-subtitle text-muted mb-0">{subtitle}</p>
      </div>
      {/* Affiche le bouton s'il existe */}
      {actionButton && <div className="ms-3">{actionButton}</div>}
    </div>
  );
};