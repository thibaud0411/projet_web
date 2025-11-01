// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Assurez-vous que ce fichier existe

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-copyright">
        © {new Date().getFullYear()} Mon Miam Miam. All rights reserved.
      </div>
      <div className="footer-links">
        {/* Mettez des liens valides si vous les ajoutez au routeur */}
        <Link to="#">Privacy Policy</Link>
        <Link to="#">Terms of Service</Link>
        <Link to="#">Support</Link>
      </div>
    </footer>
  );
};