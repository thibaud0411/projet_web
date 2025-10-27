// src/components/shared/InfoTile.tsx
import React from 'react';
import './InfoTile.css'; // <<< AJOUTÉ

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
      {/* MODIFICATION : Changement complet de la structure pour correspondre au style StatCard */}
      <div className="info-tile h-100">
        <div className={`info-tile-label`}>{label}</div>
        <div className={`info-tile-value ${valueClassName ?? ''}`}>{value}</div>
      </div>
    </div>
  );
};