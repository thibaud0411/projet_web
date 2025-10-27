// src/components/shared/InfoTileRow.tsx
import React from 'react';

interface InfoTileRowProps {
  children: React.ReactNode;
  'data-aos'?: string;
  'data-aos-delay'?: string;
}

/**
 * Un conteneur simple pour une rangée de InfoTiles.
 * Utilise 'row g-3' (petit écart) par défaut.
 */
export const InfoTileRow: React.FC<InfoTileRowProps> = ({ children, ...aosProps }) => {
  return (
    <div className="row g-3 mb-4" {...aosProps}>
      {children}
    </div>
  );
};