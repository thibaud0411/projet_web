import React, { useState } from 'react';
// Plus besoin de CSS dédié, main.css s'en occupe

interface NewEmployeeData {
  nom: string;
  email: string;
  phone: string;
}
interface EmployeeFormProps {
  onEmployeeAdd: (data: NewEmployeeData, pass: string) => void;
  successMessage: string; 
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onEmployeeAdd, successMessage }) => {
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !nom || !password || !phone) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*\d).{1,}/.test(password)) {
      setError('Le mot de passe doit contenir au moins une majuscule et un chiffre.');
      return;
    }

    onEmployeeAdd({ nom, email, phone }, password);

    setEmail('');
    setNom('');
    setPhone('');
    setPassword('');
  };

  return (
    // La classe "card" est stylisée globalement
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Ajouter un Nouvel Employé</h5>
      </div>
      
      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nom" className="form-label">Nom complet</label>
              <input type="text" className="form-control" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label">Numéro de téléphone</label>
              <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label">Mot de passe provisoire</label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="form-text">Doit contenir au moins une majuscule et un chiffre.</div>
            </div>
          </div>
          
          {/* Utilise le nouveau style global "btn-primary" */}
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