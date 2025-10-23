import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap'; // Bootstrap pour la modale
import { EmployeeList } from '../../components/shared/EmployeeList';
import { EmployeeForm } from '../../components/shared/EmployeeForm';

/* Le type 'Employee' est défini ici, dans la page principale,
  et peut être exporté pour être utilisé par les composants enfants.
*/
export interface Employee {
  id: number;
  nom: string;
  email: string;
  phone: string;
}
interface NewEmployeeData {
  nom: string;
  email: string;
  phone: string;
}

// Données de simulation
const mockEmployees: Employee[] = [
  { id: 1, nom: 'Alice Dupont', email: 'alice@miam.com', phone: '699112233' },
  { id: 2, nom: 'Bruno K.', email: 'bruno@miam.com', phone: '677445566' },
];

export const EmployeeCreatePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [successMessage, setSuccessMessage] = useState(''); // Pour le formulaire

  // Logique d'ajout (passée au formulaire)
  const handleEmployeeAdd = (data: NewEmployeeData, password: string) => {
    console.log('Création employé:', data, 'avec mdp:', password);
    
    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      ...data,
    };
    
    setEmployees([newEmployee, ...employees]);
    // Définit le message de succès et le supprime après 3 secondes
    setSuccessMessage(`Compte pour ${data.nom} créé avec succès !`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Logique de suppression (passée à la liste)
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      handleCloseModal();
    }
  };

  return (
    // Utilisation de Bootstrap: mb-4 pour l'espacement
    <div>
      <h2 className="mb-4">Gestion des Employés</h2>

      {/* --- MODIFICATION DE LA STRUCTURE ICI --- */}
      <div className="row g-4">
        {/* Colonne de gauche (plus large) pour la liste */}
        <div className="col-lg-7">
          <EmployeeList 
            employees={employees} 
            onDeleteClick={handleDeleteClick} 
          />
        </div>

        {/* Colonne de droite (plus étroite) pour le formulaire */}
        <div className="col-lg-5">
          <EmployeeForm 
            onEmployeeAdd={handleEmployeeAdd} 
            successMessage={successMessage}
          />
        </div>
      </div>
      {/* --- FIN DE LA MODIFICATION DE STRUCTURE --- */}


      {/* La modale reste en dehors de la grille */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer D <strong>{selectedEmployee?.nom}</strong> ? 
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};