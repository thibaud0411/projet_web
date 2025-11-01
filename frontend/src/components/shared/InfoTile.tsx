// src/components/shared/InfoTile.tsx
import React from 'react';
import './InfoTile.css';

interface InfoTileProps {
  value: React.ReactNode;
  label: string;
  icon: React.ReactNode; // Prop pour l'icône (ex: <i className="bi bi-grid"></i>)
  iconBgClass?: string;  // Prop pour la couleur de fond de l'icône
  valueClassName?: string;
  'data-aos'?: string;
  'data-aos-delay'?: string;
}

export const InfoTile: React.FC<InfoTileProps> = ({
  value,
  label,
  icon,
  iconBgClass = 'icon-bg-1', // Couleur par défaut
  valueClassName,
  ...aosProps
}) => {
  return (
    // 'col' prendra la place disponible dans le 'row' parent (de InfoTileRow)
    <div className="col" {...aosProps}>
      <div className="info-tile">
        <div className="tile-content">
          <div className="tile-label">{label}</div>
          <div className={`tile-value ${valueClassName ?? ''}`}>{value}</div>
        </div>
        <div className={`tile-icon-wrapper ${iconBgClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};