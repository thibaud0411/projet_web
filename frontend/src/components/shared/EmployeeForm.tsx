import React, { useState } from 'react';
// 1. Importer le type depuis la page parente
import type { NewEmployeeData } from '../../pages/manager/EmployeeCreatePage';

// 2. Mettre à jour les props
interface EmployeeFormProps {
  onEmployeeAdd: (data: NewEmployeeData, pass: string) => void;
  successMessage: string; 
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onEmployeeAdd, successMessage }) => {
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState(''); // <<<--- AJOUTÉ
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 3. Supprimer l'interface locale (elle est importée)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 4. Mettre à jour la validation
    if (!email || !nom || !prenom || !password || !phone) { // <<<--- MODIFIÉ
      setError('Tous les champs sont requis.');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*\d).{1,}/.test(password)) {
      setError('Le mot de passe doit contenir au moins une majuscule et un chiffre.');
      return;
    }

    // 5. Passer 'prenom' dans l'objet
    onEmployeeAdd({ nom, prenom, email, phone }, password); // <<<--- MODIFIÉ

    // 6. Réinitialiser 'prenom'
    setEmail('');
    setNom('');
    setPrenom(''); // <<<--- AJOUTÉ
    setPhone('');
    setPassword('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Ajouter un Nouvel Employé</h5>
      </div>
      
      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {/* 7. Mettre à jour la structure du formulaire */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nom" className="form-label">Nom</label> {/* Changé de "Nom complet" */}
              <input type="text" className="form-control" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="prenom" className="form-label">Prénom</label> {/* <<<--- AJOUTÉ */}
              <input type="text" className="form-control" id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label">Numéro de téléphone</label>
              <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="col-md-12 mb-3"> {/* Mis en pleine largeur */}
              <label htmlFor="password" className="form-label">Mot de passe provisoire</label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="form-text">Doit contenir au moins une majuscule et un chiffre.</div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            Créer le compte
          </button>
        </form>
      </div>
    </div>
  );
};