import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Employee, EmployeeFormData, EmployeeRole } from '../types/employee';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<EmployeeFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'employe',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Employee[] }>('/admin/employees');
      setEmployees(response.data.data || []);
    } catch (error: any) {
      console.error("Erreur chargement employés:", error);
      toast.error(error.response?.data?.message || "Impossible de charger la liste des employés");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'employe',
      password: ''
    });
    setEditingEmployee(null);
    setFormErrors({});
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    if (!formData.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    }
    if (!editingEmployee && !formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (editingEmployee) {
        // Update existing employee
        const { data } = await api.put<{ data: Employee }>(
          `/admin/employees/${editingEmployee.id}`,
          formData
        );
        
        setEmployees(employees.map(emp => 
          emp.id === editingEmployee.id ? data.data : emp
        ));
        
        toast.success('Employé mis à jour avec succès');
      } else {
        // Create new employee
        const { data } = await api.post<{ data: Employee }>(
          '/admin/employees',
          formData
        );
        
        setEmployees([data.data, ...employees]);
        toast.success('Employé créé avec succès');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from the server
        const serverErrors = error.response.data.errors;
        const errors: Record<string, string> = {};
        
        Object.keys(serverErrors).forEach(key => {
          errors[key] = serverErrors[key][0];
        });
        
        setFormErrors(errors);
      } else {
        toast.error(error.response?.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email,
      telephone: employee.telephone,
      role: employee.role,
      password: '' // Don't pre-fill password for security
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return;
    }

    try {
      await api.delete(`/admin/employees/${id}`);
      setEmployees(employees.filter(emp => emp.id !== id));
      toast.success('Employé supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const toggleStatus = async (employee: Employee) => {
    try {
      const newStatus = employee.statut_compte === 'actif' ? 'inactif' : 'actif';
      
      const { data } = await api.patch<{ data: Employee }>(
        `/admin/employees/${employee.id}/status`,
        { status: newStatus }
      );
      
      setEmployees(employees.map(emp => 
        emp.id === employee.id ? data.data : emp
      ));
      
      toast.success(`Statut mis à jour: ${newStatus === 'actif' ? 'Activé' : 'Désactivé'}`);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.nom.toLowerCase().includes(searchLower) ||
      employee.prenom.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.telephone.includes(searchTerm)
    );
  });

  const getRoleLabel = (role: EmployeeRole): string => {
    const roles: Record<EmployeeRole, string> = {
      administrateur: 'Administrateur',
      gerant: 'Gérant',
      employe: 'Employé'
    };
    return roles[role] || role;
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des employés</h1>
        <Button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          variant="primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un employé
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un employé..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employees table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'ajout
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                        {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.prenom} {employee.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.email}</div>
                    <div className="text-sm text-gray-500">{employee.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(employee)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.statut_compte === 'actif'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {employee.statut_compte === 'actif' ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Inactif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.created_at || '').toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Modifier"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingEmployee ? 'Modifier un employé' : 'Ajouter un employé'}
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            id="prenom"
                            value={formData.prenom}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.prenom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {formErrors.prenom && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.prenom}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            id="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full border ${formErrors.nom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                          />
                          {formErrors.nom && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          id="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full border ${formErrors.telephone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                        />
                        {formErrors.telephone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.telephone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Rôle *
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                          <option value="employe">Employé</option>
                          <option value="gerant">Gérant</option>
                          <option value="administrateur">Administrateur</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          {editingEmployee ? 'Nouveau mot de passe' : 'Mot de passe *'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder={editingEmployee ? 'Laisser vide pour ne pas modifier' : ''}
                          className={`mt-1 block w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                        />
                        {formErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                        )}
                        {!editingEmployee && (
                          <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                          disabled={loading}
                        >
                          {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => {
                            setShowModal(false);
                            resetForm();
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
