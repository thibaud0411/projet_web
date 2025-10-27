// src/components/shared/InfoTile.tsx
import React from 'react';

interface InfoTileProps {
  // 'value' peut être un simple nombre ou un élément JSX (comme un compteur animé)
  value: React.ReactNode;
  label: string;
  // Permet de passer des classes de couleur, ex: 'text-danger', 'text-warning'
  valueClassName?: string;
  'data-aos'?: string;
  'data-aos-delay'?: string;
}

export const InfoTile: React.FC<InfoTileProps> = ({ value, label, valueClassName, ...aosProps }) => {
  return (
    // 'col' prendra la place disponible dans le 'row' parent
    <div className="col" {...aosProps}>
      {/* Utilise 'h-100' pour que toutes les cartes aient la même hauteur dans une 'row' */}
      <div className="card p-3 text-center small h-100"> 
        <div className={`fs-4 fw-bold ${valueClassName ?? ''}`}>{value}</div>
        <div className="text-muted">{label}</div>
      </div>
    </div>
  );
};