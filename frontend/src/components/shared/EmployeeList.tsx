import React from 'react';
// 1. On importe le type 'Employee' depuis la page parente
import type { Employee } from '../../pages/manager/EmployeeCreatePage';
// import './EmployeeList.css'; // Supprimez ou assurez-vous que le fichier existe et est utile

// Props attendues par ce composant
interface EmployeeListProps {
  employees: Employee[];
  onDeleteClick: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onDeleteClick }) => {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Liste des Employés Actifs</h5>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            {/* Utilisation des classes globales de index.css */}
            <thead className="table-custom-header">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id_employe}> {/* Utiliser la clé primaire correcte */}
                    {/* 2. Accéder aux données via l'objet 'utilisateur' */}
                    <td className="table-custom-cell fw-bold">{emp.utilisateur.nom}</td>
                    <td className="table-custom-cell">{emp.utilisateur.email}</td>
                    <td className="table-custom-cell">{emp.utilisateur.telephone}</td>
                    <td className="table-custom-cell">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        title="Modifier (à implémenter)"
                        disabled // Désactivé pour l'instant
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Désactiver"
                        onClick={() => onDeleteClick(emp)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="table-custom-cell text-center text-muted">
                    Aucun employé actif trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};