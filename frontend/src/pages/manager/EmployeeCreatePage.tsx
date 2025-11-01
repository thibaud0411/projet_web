import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { EmployeeList } from '../../components/shared/EmployeeList';
import { EmployeeForm } from '../../components/shared/EmployeeForm';
// On importe directement apiClient ici
import apiClient from '../../apiClient';

/*
  Définition du type Employee (correspond à la réponse JSON de Laravel)
*/
export interface Employee {
  id_employe: number;
  utilisateur: {
    nom: string;
    prenom?: string; // Ajouté comme optionnel
    email: string;
    telephone: string;
  };
}

// Type pour les données du formulaire
export interface NewEmployeeData {
  nom: string;
  prenom?: string; // Optionnel ici aussi
  email: string;
  phone: string; // Le formulaire utilise 'phone'
}

export const EmployeeCreatePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --- LIRE LES DONNÉES AU CHARGEMENT ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await apiClient.get('/employees');
        setEmployees(response.data);
      } catch (error: any) {
        console.error("Erreur chargement employés:", error);
        setErrorMessage( error.response?.data?.message || "Impossible de charger la liste des employés.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []); // [] = exécuter une seule fois

  // --- CRÉER UN EMPLOYÉ ---
  const handleEmployeeAdd = async (data: NewEmployeeData, password: string) => {
    try {
      setSuccessMessage('');
      setErrorMessage('');

      // Appel POST vers /api/employees
      // Assurez-vous que les clés ici ('nom', 'email', 'phone', 'password')
      // correspondent à ce que $request->validate() attend dans le contrôleur.
      const response = await apiClient.post('/employees', {
        nom: data.nom,
        prenom: data.prenom ?? '',
        email: data.email,
        phone: data.phone,
        password: password,
      });

      setEmployees([response.data, ...employees]); // Ajoute le nouvel employé à la liste
      setSuccessMessage(`Compte pour ${data.nom} créé avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error: any) {
      console.error('Erreur création employé:', error);
      if (error.response?.status === 422) {
         const validationErrors = error.response.data.errors;
         const errorMessages = Object.values(validationErrors).flat().join(' ');
         setErrorMessage(`Erreur de validation: ${errorMessages}`);
      } else {
         setErrorMessage(error.response?.data?.message || 'Une erreur est survenue lors de la création.');
      }
    }
  };

  // --- Gérer la modale de suppression ---
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
    setErrorMessage(''); // Reset error message when opening modal
  };
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  // --- SUPPRIMER UN EMPLOYÉ ---
  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      try {
        setErrorMessage('');
        // Appel DELETE vers /api/employees/{id_employe}
        await apiClient.delete(`/employees/${selectedEmployee.id_employe}`);

        setEmployees(employees.filter(emp => emp.id_employe !== selectedEmployee.id_employe));
        handleCloseModal();

      } catch (error: any) {
        console.error('Erreur suppression employé:', error);
        setErrorMessage(error.response?.data?.message || "Erreur lors de la désactivation de l'employé.");
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4">Gestion des Employés</h2>
      {/* Afficher l'erreur principale en haut */}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          {loading ? (
            <div className="card"><div className="card-body text-center">Chargement...</div></div>
          ) : (
            <EmployeeList
              employees={employees}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </div>

        <div className="col-lg-5">
          <EmployeeForm
            onEmployeeAdd={handleEmployeeAdd}
            successMessage={successMessage}
            // Passer l'erreur au formulaire s'il doit l'afficher aussi
            // errorMessage={errorMessage}
          />
        </div>
      </div>

      {/* Modale de Confirmation */}
      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la désactivation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir désactiver
          <strong> {selectedEmployee?.utilisateur.nom}</strong> ?
          {/* Afficher l'erreur de suppression ici si besoin */}
          {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Désactiver</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};