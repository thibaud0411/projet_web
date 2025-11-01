import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string;
  changeText: string;
  changeColor: 'text-success' | 'text-danger' | 'text-muted';
  iconClass: string;
  iconBgColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, changeText, changeColor, iconClass, iconBgColor }) => {
  return (
    <div className="stat-card h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div className="stat-card-info">
          <h5 className="stat-card-title">{title}</h5>
          <p className="stat-card-value">{value}</p>
          <span className={`stat-card-change ${changeColor}`}>{changeText}</span>
        </div>
        <div className="stat-card-icon" style={{ backgroundColor: iconBgColor }}>
          <i className={iconClass}></i>
        </div>
      </div>
    </div>
  );
};