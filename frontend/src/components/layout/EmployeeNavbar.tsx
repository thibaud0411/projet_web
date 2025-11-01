// src/components/layout/EmployeeNavbar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './EmployeeNavbar.css'; 

interface EmployeeNavbarProps {}

export const EmployeeNavbar: React.FC<EmployeeNavbarProps> = () => {

  const notificationCount = 0;

  return (
    <header className="app-navbar">
      
      <div className="nav-logo">
        <NavLink to="/employee">
          Mon Miam Miam
          <span className="nav-subtitle">Employee Dashboard</span>
        </NavLink>
      </div>

      {/* --- LIENS MIS À JOUR AVEC ICÔNES --- */}
      <nav className="nav-links">
        <NavLink to="/employee/orders">
          <i className="bi bi-receipt"></i>
          <span>Orders</span>
        </NavLink>
        <NavLink to="/employee/menu">
          <i className="bi bi-journal-text"></i>
          <span>Menu</span>
        </NavLink>
        <NavLink to="/employee/stats">
          <i className="bi bi-bar-chart-line"></i>
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/employee/claims">
          <i className="bi bi-shield-exclamation"></i>
          <span>Claims</span>
        </NavLink>
      </nav>

      <div className="nav-profile">
        <i className="bi bi-bell">
          {notificationCount > 0 && (
             <span className="notification-dot">{notificationCount}</span>
          )}
        </i>
        <div className="nav-avatar-placeholder">
          <i className="bi bi-person-fill"></i>
        </div>
      </div>
    </header>
  );
};