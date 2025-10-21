import { useState, useEffect } from 'react';
import { Search, Eye, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
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
    const [priorityFilter, setPriorityFilter] = useState('all');
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
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const updateComplaintStatus = async (complaintId, newStatus) => {
        try {
            await api.patch(`/admin/complaints/${complaintId}/status`, {
                statut: newStatus
            });
            toast.success('Statut mis à jour');
            fetchComplaints();
            if (selectedComplaint?.id === complaintId) {
                viewComplaintDetails(complaintId);
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const submitResponse = async (e) => {
        e.preventDefault();

        if (!responseText.trim()) {
            toast.error('Veuillez saisir une réponse');
            return;
        }

        try {
            await api.post(`/admin/complaints/${selectedComplaint.id}/respond`, {
                reponse: responseText,
            });
            toast.success('Réponse envoyée avec succès');
            setShowDetailsModal(false);
            fetchComplaints();
        } catch (error) {
            toast.error('Erreur lors de l\'envoi de la réponse');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            en_attente: 'bg-yellow-100 text-yellow-800',
            en_cours: 'bg-blue-100 text-blue-800',
            resolue: 'bg-green-100 text-green-800',
            rejetee: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            basse: 'bg-gray-100 text-gray-800',
            normale: 'bg-blue-100 text-blue-800',
            haute: 'bg-orange-100 text-orange-800',
            urgente: 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgente':
                return <AlertCircle size={16} className="text-red-600" />;
            case 'haute':
                return <AlertCircle size={16} className="text-orange-600" />;
            default:
                return <MessageSquare size={16} className="text-gray-600" />;
        }
    };

    const statusOptions = [
        { value: 'all', label: 'Toutes' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'en_cours', label: 'En cours' },
        { value: 'resolue', label: 'Résolue' },
        { value: 'rejetee', label: 'Rejetée' },
    ];

    const priorityOptions = [
        { value: 'all', label: 'Toutes' },
        { value: 'basse', label: 'Basse' },
        { value: 'normale', label: 'Normale' },
        { value: 'haute', label: 'Haute' },
        { value: 'urgente', label: 'Urgente' },
    ];

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.client_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || complaint.statut === statusFilter;
        const matchesPriority = priorityFilter === 'all' || complaint.priorite === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des réclamations</h1>
                <p className="text-gray-600 mt-1">
                    Traitez les réclamations et plaintes des clients
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'En attente', count: complaints.filter(c => c.statut === 'en_attente').length, color: 'bg-yellow-500', icon: Clock },
                    { label: 'En cours', count: complaints.filter(c => c.statut === 'en_cours').length, color: 'bg-blue-500', icon: MessageSquare },
                    { label: 'Résolues', count: complaints.filter(c => c.statut === 'resolue').length, color: 'bg-green-500', icon: CheckCircle },
                    { label: 'Urgentes', count: complaints.filter(c => c.priorite === 'urgente' && c.statut !== 'resolue').length, color: 'bg-red-500', icon: AlertCircle },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                <Icon className="text-white" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {priorityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sujet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Priorité
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredComplaints.map((complaint) => (
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
                                                <div className="text-sm text-gray-500">
                                                    {complaint.client_email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {complaint.sujet}
                                        </div>
                                        <div className="text-sm text-gray-500 line-clamp-1">
                                            {complaint.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priorite)}`}>
                                            {getPriorityIcon(complaint.priorite)}
                                            {complaint.priorite.charAt(0).toUpperCase() + complaint.priorite.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.statut)}`}>
                                            {complaint.statut.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(complaint.date_creation), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => viewComplaintDetails(complaint.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Voir détails"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {complaint.statut === 'en_attente' && (
                                                <button
                                                    onClick={() => updateComplaintStatus(complaint.id, 'en_cours')}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Prendre en charge"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                            )}

                                            {(complaint.statut === 'en_attente' || complaint.statut === 'en_cours') && (
                                                <>
                                                    <button
                                                        onClick={() => updateComplaintStatus(complaint.id, 'resolue')}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Résoudre"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateComplaintStatus(complaint.id, 'rejetee')}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredComplaints.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucune réclamation trouvée</p>
                </div>
            )}

            {/* Complaint Details Modal */}
            {showDetailsModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Détails de la réclamation</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Status and Priority */}
                            <div className="flex items-center gap-4 pb-4 border-b">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedComplaint.statut)}`}>
                                    {selectedComplaint.statut.replace('_', ' ')}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedComplaint.priorite)}`}>
                                    {getPriorityIcon(selectedComplaint.priorite)}
                                    Priorité {selectedComplaint.priorite}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Informations client</h3>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Nom</p>
                                        <p className="font-semibold">
                                            {selectedComplaint.client_prenom} {selectedComplaint.client_nom}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-semibold">{selectedComplaint.client_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Téléphone</p>
                                        <p className="font-semibold">{selectedComplaint.client_telephone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date de création</p>
                                        <p className="font-semibold">
                                            {format(new Date(selectedComplaint.date_creation), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            {selectedComplaint.numero_commande && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Commande concernée</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Numéro de commande</p>
                                        <p className="font-semibold text-blue-600">
                                            {selectedComplaint.numero_commande}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Complaint Details */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Réclamation</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Sujet</p>
                                        <p className="font-semibold text-lg">{selectedComplaint.sujet}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Description</p>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-800 whitespace-pre-wrap">
                                                {selectedComplaint.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-lg mb-3">Réponse</h3>

                                {selectedComplaint.reponse ? (
                                    <div className="space-y-3">
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <p className="text-gray-800 whitespace-pre-wrap">
                                                {selectedComplaint.reponse}
                                            </p>
                                        </div>
                                        {selectedComplaint.date_traitement && (
                                            <p className="text-sm text-gray-500">
                                                Répondu le {format(new Date(selectedComplaint.date_traitement), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                                {selectedComplaint.employe_nom && (
                                                    <> par {selectedComplaint.employe_prenom} {selectedComplaint.employe_nom}</>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={submitResponse} className="space-y-3">
                                        <textarea
                                            rows="4"
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Saisissez votre réponse au client..."
                                            required
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                className="flex-1"
                                            >
                                                Envoyer la réponse
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Status Change Actions */}
                            {selectedComplaint.statut !== 'resolue' && selectedComplaint.statut !== 'rejetee' && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-lg mb-3">Actions</h3>
                                    <div className="flex gap-3">
                                        {selectedComplaint.statut === 'en_attente' && (
                                            <Button
                                                variant="primary"
                                                onClick={() => {
                                                    updateComplaintStatus(selectedComplaint.id, 'en_cours');
                                                }}
                                                className="flex-1"
                                            >
                                                Prendre en charge
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (window.confirm('Êtes-vous sûr de vouloir marquer cette réclamation comme résolue?')) {
                                                    updateComplaintStatus(selectedComplaint.id, 'resolue');
                                                    setShowDetailsModal(false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Marquer comme résolue
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                if (window.confirm('Êtes-vous sûr de vouloir rejeter cette réclamation?')) {
                                                    updateComplaintStatus(selectedComplaint.id, 'rejetee');
                                                    setShowDetailsModal(false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            Rejeter
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;