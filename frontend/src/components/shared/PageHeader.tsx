// src/components/shared/PageHeader.tsx
import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actionButton }) => {
  return (
    // --- MODIFIÉ : Ajout de "mb-4" pour l'espacement Bootstrap ---
    <div className="page-header-container mb-4" data-aos="fade-up">
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actionButton && (
        <div className="page-header-action">
          {actionButton}
        </div>
      )}
    </div>
  );
};