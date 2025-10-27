import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // Backend admin listing route is /admin/commandes-all
      const response = await api.get('/admin/commandes-all');
      const data = Array.isArray(response.data) ? response.data : response.data.data ?? [];
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Backend admin update endpoint: PATCH /admin/commandes/{id}
      await api.patch(`/admin/commandes/${orderId}`, { statut: newStatus });
      toast.success('Statut mis à jour');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      // Order details are available at /commandes/{id}
      const response = await api.get(`/commandes/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'prete', label: 'Prête' },
    { value: 'en_livraison', label: 'En livraison' },
    { value: 'livree', label: 'Livrée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      confirmee: 'bg-blue-100 text-blue-800',
      en_preparation: 'bg-purple-100 text-purple-800',
      prete: 'bg-green-100 text-green-800',
      en_livraison: 'bg-indigo-100 text-indigo-800',
      livree: 'bg-green-100 text-green-800',
      annulee: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      en_attente: 'confirmee',
      confirmee: 'en_preparation',
      en_preparation: 'prete',
      prete: 'en_livraison',
      en_livraison: 'livree',
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.statut === statusFilter;
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="text-gray-600 mt-1">
          Suivez et gérez toutes les commandes en temps réel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'En attente', count: orders.filter(o => o.statut === 'en_attente').length, color: 'bg-yellow-500' },
          { label: 'En préparation', count: orders.filter(o => o.statut === 'en_preparation').length, color: 'bg-purple-500' },
          { label: 'En livraison', count: orders.filter(o => o.statut === 'en_livraison').length, color: 'bg-blue-500' },
          { label: 'Livrées (aujourd\'hui)', count: orders.filter(o => o.statut === 'livree' && new Date(o.date_commande).toDateString() === new Date().toDateString()).length, color: 'bg-green-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <Package className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
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
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Montant
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.numero_commande}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.client_prenom} {order.client_nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.client_telephone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.type_service === 'livraison'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {order.type_service === 'livraison' ? <Truck size={12} /> : <Package size={12} />}
                      {order.type_service === 'livraison' ? 'Livraison' : 'Sur place'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.montant_total?.toLocaleString('fr-FR')} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                      {order.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.date_commande), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {getNextStatus(order.statut) && (
                        <button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.statut))}
                          className="text-green-600 hover:text-green-800"
                          title="Passer à l'étape suivante"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      
                      {order.statut !== 'annulee' && order.statut !== 'livree' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'annulee')}
                          className="text-red-600 hover:text-red-800"
                          title="Annuler"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune commande trouvée</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Détails de la commande
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro de commande</p>
                  <p className="font-semibold">{selectedOrder.numero_commande}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedOrder.date_commande), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type de service</p>
                  <p className="font-semibold capitalize">{selectedOrder.type_service.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.statut)}`}>
                    {selectedOrder.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informations client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-semibold">{selectedOrder.client_prenom} {selectedOrder.client_nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-semibold">{selectedOrder.client_telephone}</p>
                  </div>
                  {selectedOrder.adresse_livraison && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Adresse de livraison</p>
                      <p className="font-semibold">{selectedOrder.adresse_livraison}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Articles commandés</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.nom_produit}</p>
                        {item.notes_speciales && (
                          <p className="text-sm text-gray-600">Note: {item.notes_speciales}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {item.quantite} x {item.prix_unitaire?.toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="font-semibold">
                          {item.sous_total?.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">
                      {selectedOrder.montant_total?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  {selectedOrder.montant_reduction > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{selectedOrder.montant_reduction?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  {selectedOrder.points_utilises > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Points utilisés</span>
                      <span>{selectedOrder.points_utilises} points</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      {(selectedOrder.montant_total - selectedOrder.montant_reduction)?.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {selectedOrder.commentaire_client && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Commentaire du client</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.commentaire_client}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                {getNextStatus(selectedOrder.statut) && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.statut));
                      setShowDetailsModal(false);
                    }}
                    className="flex-1"
                  >
                    Passer à l'étape suivante
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;