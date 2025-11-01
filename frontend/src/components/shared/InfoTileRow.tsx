// src/components/shared/InfoTileRow.tsx
import React from 'react';

// --- DÉBUT DE LA MODIFICATION ---

// 1. L'interface "extends" les attributs HTML standards d'une DIV.
// Cela lui donne automatiquement 'className', 'style', 'data-aos', etc.
interface InfoTileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Nous n'avons plus besoin de lister 'data-aos' ou 'className' ici
}

export const InfoTileRow: React.FC<InfoTileRowProps> = ({ 
  children, 
  className = '', // On récupère 'className' depuis les props...
  ...rest          // ...et 'rest' capture tout le reste ('data-aos', 'style', etc.)
}) => {
  return (
    // 2. On applique 'className' et on propage '...rest' à la div.
    <div className={`info-tile-row row g-4 ${className}`} {...rest}>
      {children}
    </div>
  );
};
// --- FIN DE LA MODIFICATION ---