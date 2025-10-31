import { useState, useEffect } from 'react';
import { Search, Eye, Truck, Package, Clock, Check, X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { Order, OrderStatus, StatusOption, OrderStats } from '../types/order';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'en_attente', label: 'En attente', icon: <Clock size={16} /> },
    { value: 'confirmee', label: 'Confirmée', icon: <Check size={16} /> },
    { value: 'en_preparation', label: 'En préparation', icon: <Package size={16} /> },
    { value: 'prete', label: 'Prête', icon: <Check size={16} /> },
    { value: 'en_livraison', label: 'En livraison', icon: <Truck size={16} /> },
    { value: 'livree', label: 'Livrée', icon: <Check size={16} /> },
    { value: 'annulee', label: 'Annulée', icon: <X size={16} /> },
  ];

  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    en_attente: 'confirmee',
    confirmee: 'en_preparation',
    en_preparation: 'prete',
    prete: 'en_livraison',
    en_livraison: 'livree',
    livree: null,
    annulee: null,
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      const response = await api.get<Order[]>('/admin/commandes-all');
      const data = Array.isArray(response.data) ? response.data : [];
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus): Promise<void> => {
    try {
      setIsUpdating(true);
      await api.patch(`/admin/commandes/${orderId}`, { statut: newStatus });
      await fetchOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const viewOrderDetails = async (orderId: number): Promise<void> => {
    try {
      const response = await api.get<Order>(`/commandes/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    return statusFlow[currentStatus];
  };

  const getStatusLabel = (status: OrderStatus): string => {
    return statusOptions.find(opt => opt.value === status)?.label || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats: OrderStats[] = [
    { 
      label: 'En attente', 
      count: orders.filter(o => o.statut === 'en_attente').length, 
      color: 'bg-yellow-500',
      icon: <Clock size={20} />
    },
    { 
      label: 'En préparation', 
      count: orders.filter(o => o.statut === 'en_preparation').length, 
      color: 'bg-purple-500',
      icon: <Package size={20} />
    },
    { 
      label: 'En livraison', 
      count: orders.filter(o => o.statut === 'en_livraison').length, 
      color: 'bg-blue-500',
      icon: <Truck size={20} />
    },
    { 
      label: 'Livrées (aujourd\'hui)', 
      count: orders.filter(o => 
        o.statut === 'livree' && 
        new Date(o.date_commande).toDateString() === new Date().toDateString()
      ).length, 
      color: 'bg-green-500',
      icon: <Check size={20} />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="text-gray-600 mt-1">Suivez et gérez toutes les commandes en temps réel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {orderStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

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
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
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
              {filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.statut);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.numero_commande}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.client.prenom} {order.client.nom}
                      </div>
                      <div className="text-sm text-gray-500">{order.client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.type_commande === 'livraison' ? 'Livraison' : 
                         order.type_commande === 'sur_place' ? 'Sur place' : 'À emporter'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {order.montant_total.toFixed(2)} €
                      </div>
                      {order.type_commande === 'livraison' && (
                        <div className="text-xs text-gray-500">
                          Dont {order.frais_livraison.toFixed(2)} € de frais
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.statut)}`}>
                        {getStatusLabel(order.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.date_commande), 'PPp', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        {nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="text-green-600 hover:text-green-900"
                            disabled={isUpdating}
                            title={`Passer à ${getStatusLabel(nextStatus)}`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        )}
                        {order.statut === 'en_attente' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'annulee')}
                            className="text-red-600 hover:text-red-900"
                            disabled={isUpdating}
                            title="Annuler la commande"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune commande trouvée</p>
          </div>
        )}
      </div>

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Commande {selectedOrder.numero_commande}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedOrder.date_commande), 'PPPPpppp', { locale: fr })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Client</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      {selectedOrder.client.prenom} {selectedOrder.client.nom}
                    </p>
                    <p className="text-gray-600">{selectedOrder.client.email}</p>
                    <p className="text-gray-600">{selectedOrder.client.telephone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedOrder.type_commande === 'livraison' ? 'Livraison' : 'Informations'}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.type_commande === 'livraison' ? (
                      <div>
                        <p className="font-medium">Adresse de livraison</p>
                        <p className="text-gray-600">{selectedOrder.adresse_livraison.adresse}</p>
                        <p className="text-gray-600">
                          {selectedOrder.adresse_livraison.code_postal} {selectedOrder.adresse_livraison.ville}
                        </p>
                        <p className="text-gray-600">{selectedOrder.adresse_livraison.pays}</p>
                        <p className="text-gray-600 mt-2">Téléphone: {selectedOrder.adresse_livraison.telephone}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">
                          {selectedOrder.type_commande === 'sur_place' ? 'Sur place' : 'À emporter'}
                        </p>
                        {selectedOrder.commentaire && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Commentaire :</p>
                            <p className="text-gray-600">{selectedOrder.commentaire}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Articles</h3>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {selectedOrder.articles.map((item, idx) => (
                        <li key={idx} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.quantite}x {item.nom}
                                  </p>
                                  {item.commentaire && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Note: {item.commentaire}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                {(item.prix_unitaire * item.quantite).toFixed(2)} €
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.prix_unitaire.toFixed(2)} €/u
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Sous-total :</span>
                      <span className="font-medium">
                        {(selectedOrder.montant_total - selectedOrder.frais_livraison).toFixed(2)} €
                      </span>
                    </div>
                    {selectedOrder.type_commande === 'livraison' && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Frais de livraison :</span>
                        <span className="font-medium">
                          {selectedOrder.frais_livraison.toFixed(2)} €
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-3">
                      <span className="text-lg font-bold">Total :</span>
                      <span className="text-lg font-bold">
                        {selectedOrder.montant_total.toFixed(2)} €
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Statut :</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.statut)}`}>
                          {getStatusLabel(selectedOrder.statut)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Paiement :</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.statut_paiement === 'payee' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.statut_paiement === 'payee' ? 'Payée' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Fermer
                </button>
                {getNextStatus(selectedOrder.statut) && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = getNextStatus(selectedOrder.statut);
                      if (nextStatus) {
                        updateOrderStatus(selectedOrder.id, nextStatus);
                        setShowDetailsModal(false);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Passer à {getNextStatus(selectedOrder.statut) && getStatusLabel(getNextStatus(selectedOrder.statut) as OrderStatus)}
                    <ChevronRight className="ml-2 -mr-1 h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
