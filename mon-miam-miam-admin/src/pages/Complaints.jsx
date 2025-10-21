import { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/admin/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réclamations', error);
      toast.error('Erreur lors du chargement des réclamations');
    } finally {
      setLoading(false);
    }
  };
  const viewComplaintDetails = async (complaintId) => {
    try {
      const response = await api.get(`/admin/complaints/${complaintId}`);
      setSelectedComplaint(response.data);
      setResponseText(response.data.reponse || '');
      setShowDetailsModal(true);
    } catch (error) {
      console.error(`Erreur lors du chargement des détails pour la réclamation ${complaintId}`, error);
      toast.error('Erreur lors du chargement des détails');
    }
  };
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.patch(`/admin/complaints/${complaintId}/status`, { statut: newStatus });
      toast.success('Statut mis à jour');
      fetchComplaints();
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, statut: newStatus });
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut pour la réclamation ${complaintId}`, error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const submitResponse = async (e) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    try {
      await api.post(`/admin/complaints/${selectedComplaint.id}/respond`, {
        reponse: responseText
      });
      toast.success('Réponse envoyée avec succès');
      fetchComplaints();
      viewComplaintDetails(selectedComplaint.id);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la réponse pour la réclamation ${selectedComplaint?.id}`, error);
      toast.error('Erreur lors de l\'envoi de la réponse');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Toutes', color: 'bg-gray-500' },
    { value: 'en_attente', label: 'En attente', color: 'bg-yellow-500' },
    { value: 'en_cours', label: 'En cours', color: 'bg-blue-500' },
    { value: 'resolue', label: 'Résolue', color: 'bg-green-500' },
    { value: 'rejetee', label: 'Rejetée', color: 'bg-red-500' },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      en_attente: { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        iconColor: 'text-yellow-600'
      },
      en_cours: { 
        label: 'En cours', 
        color: 'bg-blue-100 text-blue-800',
        icon: AlertCircle,
        iconColor: 'text-blue-600'
      },
      resolue: { 
        label: 'Résolue', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      rejetee: { 
        label: 'Rejetée', 
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
    };
    return configs[status] || configs.en_attente;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      basse: { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
      moyenne: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
      haute: { label: 'Haute', color: 'bg-orange-100 text-orange-800' },
      urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
    };
    return configs[priority] || configs.basse;
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.client_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des réclamations</h1>
          <p className="text-gray-600 mt-1">
            Gérez et répondez aux réclamations des clients
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.slice(1).map((status) => {
          const count = complaints.filter(c => c.statut === status.value).length;
          return (
            <div key={status.value} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{status.label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
                <div className={`w-12 h-12 ${status.color} rounded-lg flex items-center justify-center`}>
                  <MessageSquare className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une réclamation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => {
                const statusConfig = getStatusConfig(complaint.statut);
                const priorityConfig = getPriorityConfig(complaint.priorite);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          {complaint.client_prenom?.charAt(0)}{complaint.client_nom?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.client_prenom} {complaint.client_nom}
                          </div>
                          <div className="text-sm text-gray-500">{complaint.client_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint.sujet}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {complaint.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewComplaintDetails(complaint.id)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Aucune réclamation trouvée</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Détails de la réclamation</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedComplaint(null);
                  setResponseText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">
                    {selectedComplaint.client_prenom} {selectedComplaint.client_nom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedComplaint.client_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{selectedComplaint.client_telephone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedComplaint.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusConfig(selectedComplaint.statut).color}`}>
                  {getStatusConfig(selectedComplaint.statut).label}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityConfig(selectedComplaint.priorite).color}`}>
                  Priorité: {getPriorityConfig(selectedComplaint.priorite).label}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Sujet</h3>
                <p className="text-gray-700">{selectedComplaint.sujet}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.numero_commande && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Numéro de commande</h3>
                  <p className="text-gray-900">{selectedComplaint.numero_commande}</p>
                </div>
              )}
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Mettre à jour le statut</h3>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.slice(1).map((status) => (
                  <Button
                    key={status.value}
                    onClick={() => updateComplaintStatus(selectedComplaint.id, status.value)}
                    variant={selectedComplaint.statut === status.value ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Response Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {selectedComplaint.reponse ? 'Réponse envoyée' : 'Répondre à la réclamation'}
              </h3>
              
              {selectedComplaint.reponse ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.reponse}</p>
                  {selectedComplaint.date_reponse && (
                    <p className="text-sm text-gray-500 mt-2">
                      Envoyée le {format(new Date(selectedComplaint.date_reponse), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={submitResponse}>
                  <textarea
                    rows="4"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Entrez votre réponse..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                    required
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedComplaint(null);
                        setResponseText('');
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Envoyer la réponse
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
