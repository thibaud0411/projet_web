// src/components/shared/InfoTileRow.tsx
import React from 'react';

interface InfoTileRowProps {
  children: React.ReactNode;
  'data-aos'?: string;
  'data-aos-delay'?: string;
  className?: string; // <-- 1. AJOUT DE CETTE LIGNE
}

export const InfoTileRow: React.FC<InfoTileRowProps> = ({ 
  children, 
  className = '', // <-- 2. RÉCUPÉRATION DE LA PROP
  ...aosProps 
}) => {
  return (
    // --- 3. UTILISATION DE LA PROP className ---
    <div className={`info-tile-row row g-4 ${className}`} {...aosProps}>
      {children}
    </div>
  );
};