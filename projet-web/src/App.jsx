import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Accueil';
import GestionMenu from './components/GestionMenu';
import Stats from './components/Stats';
import Reclamations from './components/Reclamations';
import Commandes from './components/Commandes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/gestion" element={<GestionMenu />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/reclamations" element={<Reclamations />} />
        <Route path="/commandes" element={<Commandes />} />
      </Routes>
    </Router>
  );
}

export default App;