import React from 'react';
// On exporte le type depuis le fichier parent
import type { Employee } from '../../pages/manager/EmployeeCreatePage';
import './EmployeeList.css'; // Importe son CSS (maintenant simplifié)

interface EmployeeListProps {
  employees: Employee[];
  onDeleteClick: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onDeleteClick }) => {
  return (
    // La classe "card" est maintenant stylisée globalement
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Liste des Employés Actifs</h5>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          {/* On utilise les classes globales "table-custom-header" et "table-custom-cell" */}
          <table className="table align-middle mb-0">
            <thead className="table-custom-header">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="table-custom-cell fw-bold">{emp.nom}</td>
                  <td className="table-custom-cell">{emp.email}</td>
                  <td className="table-custom-cell">{emp.phone}</td>
                  <td className="table-custom-cell">
                    {/* Utilise le nouveau style global "btn-outline-primary" */}
                    <button 
                      className="btn btn-outline-primary btn-sm me-2" 
                      title="Modifier"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm" 
                      title="Supprimer"
                      onClick={() => onDeleteClick(emp)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};