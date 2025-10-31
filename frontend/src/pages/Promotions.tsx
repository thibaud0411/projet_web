import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/axios';
import { Promotion, PromotionFormData, PromotionType } from '../types/promotion';

export default function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState<PromotionFormData>({
        titre: '',
        description: '',
        type_promotion: 'pourcentage',
        valeur: '',
        code_promo: '',
        date_debut: '',
        date_fin: '',
        conditions: '',
        limite_utilisations: '',
        image_affiche: '',
        est_active: true,
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async (): Promise<void> => {
        try {
            const response = await api.get<{ data: Promotion[] }>('/admin/promotions-admin');
            const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

            const normalized = data.map((p: any) => ({
                id: p.id_promotion ?? p.id ?? 0,
                titre: p.titre,
                description: p.description || '',
                type_promotion: (p.type_promotion || (p.reduction ? 'pourcentage' : 'montant_fixe')) as PromotionType,
                valeur: p.reduction ?? p.montant_reduction ?? '',
                code_promo: p.code_promo || '',
                date_debut: p.date_debut,
                date_fin: p.date_fin,
                conditions: p.conditions || '',
                limite_utilisations: p.limite_utilisations || '',
                image_affiche: p.image_url || p.image_affiche || '',
                est_active: p.active ?? p.est_active ?? true,
                nombre_utilisations: p.nombre_utilisations || 0,
            }));

            setPromotions(normalized);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();

        if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
            alert('La date de fin doit être après la date de début');
            return;
        }

        try {
            const payload: any = {
                titre: formData.titre,
                description: formData.description,
                code_promo: formData.code_promo,
                date_debut: formData.date_debut,
                date_fin: formData.date_fin,
                limite_utilisations: formData.limite_utilisations || null,
                image_url: formData.image_affiche,
                active: formData.est_active,
            };

            if (formData.type_promotion === 'pourcentage') {
                payload.reduction = parseFloat(formData.valeur);
            } else if (formData.type_promotion === 'montant_fixe') {
                payload.montant_reduction = parseFloat(formData.valeur);
            }

            if (editingPromotion) {
                await api.put(`/admin/promotions-admin/${editingPromotion.id}`, payload);
                alert('Promotion mise à jour avec succès');
            } else {
                await api.post('/admin/promotions-admin', payload);
                alert('Promotion créée avec succès');
            }

            setShowModal(false);
            resetForm();
            await fetchPromotions();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Une erreur est survenue');
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

        try {
            await api.delete(`/admin/promotions-admin/${id}`);
            await fetchPromotions();
        } catch (error) {
            console.error(error);
        }
    };

    const togglePromotion = async (promotion: Promotion): Promise<void> => {
        try {
            await api.patch(`/admin/promotions-admin/${promotion.id}`, {
                active: !promotion.est_active
            });
            await fetchPromotions();
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = (promotion: Promotion): void => {
        setEditingPromotion(promotion);
        setFormData({
            titre: promotion.titre,
            description: promotion.description || '',
            type_promotion: promotion.type_promotion,
            valeur: promotion.valeur.toString(),
            code_promo: promotion.code_promo || '',
            date_debut: promotion.date_debut,
            date_fin: promotion.date_fin,
            conditions: promotion.conditions || '',
            limite_utilisations: promotion.limite_utilisations.toString(),
            image_affiche: promotion.image_affiche || '',
            est_active: promotion.est_active,
        });
        setShowModal(true);
    };

    const resetForm = (): void => {
        setEditingPromotion(null);
        setFormData({
            titre: '',
            description: '',
            type_promotion: 'pourcentage',
            valeur: '',
            code_promo: '',
            date_debut: '',
            date_fin: '',
            conditions: '',
            limite_utilisations: '',
            image_affiche: '',
            est_active: true,
        });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target as HTMLInputElement;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const getPromotionTypeLabel = (type: PromotionType): string => {
        const types = {
            pourcentage: 'Pourcentage',
            montant_fixe: 'Montant fixe',
            produit_gratuit: 'Produit gratuit',
            points_bonus: 'Points bonus',
        };
        return types[type] || type;
    };

    const getPromotionTypeIcon = (type: PromotionType): React.ReactNode => {
        switch (type) {
            case 'pourcentage':
                return <Percent size={16} />;
            case 'montant_fixe':
                return <span>💰</span>;
            case 'produit_gratuit':
                return <span>🎁</span>;
            case 'points_bonus':
                return <span>⭐</span>;
            default:
                return null;
        }
    };

    const isPromotionActive = (promotion: Promotion): boolean => {
        if (!promotion.est_active) return false;
        
        const now = new Date();
        const startDate = new Date(promotion.date_debut);
        const endDate = new Date(promotion.date_fin);
        
        return now >= startDate && now <= endDate;
    };

    const filteredPromotions = promotions.filter(promotion => 
        promotion.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.code_promo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Promotions</h1>
                    <p className="text-gray-600">Créez et gérez les promotions et codes promo</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Nouvelle promotion
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Rechercher une promotion..."
                            className="w-full bg-transparent outline-none text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Détails
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Période
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilisations
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPromotions.map((promotion) => (
                                <tr key={promotion.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {promotion.code_promo}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getPromotionTypeLabel(promotion.type_promotion)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {promotion.titre}
                                        </div>
                                        <div className="text-sm text-gray-500 line-clamp-2">
                                            {promotion.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {format(new Date(promotion.date_debut), 'dd/MM/yyyy', { locale: fr })}
                                            {' - '}
                                            {format(new Date(promotion.date_fin), 'dd/MM/yyyy', { locale: fr })}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isPromotionActive(promotion) ? (
                                                <span className="text-green-600">En cours</span>
                                            ) : new Date() < new Date(promotion.date_debut) ? (
                                                <span className="text-blue-600">À venir</span>
                                            ) : (
                                                <span className="text-red-600">Expirée</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {promotion.nombre_utilisations}
                                            {promotion.limite_utilisations && ` / ${promotion.limite_utilisations}`}
                                        </div>
                                        <div className="text-xs text-gray-500">utilisations</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => togglePromotion(promotion)}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                promotion.est_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {promotion.est_active ? (
                                                <>
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                    Inactive
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(promotion)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promotion.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Promotion Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Titre de la promotion *
                                        </label>
                                        <input
                                            type="text"
                                            name="titre"
                                            value={formData.titre}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type de promotion *
                                        </label>
                                        <select
                                            name="type_promotion"
                                            value={formData.type_promotion}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="pourcentage">Pourcentage de réduction</option>
                                            <option value="montant_fixe">Montant fixe de réduction</option>
                                            <option value="produit_gratuit">Produit gratuit</option>
                                            <option value="points_bonus">Points bonus</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {formData.type_promotion === 'pourcentage' 
                                                ? 'Pourcentage de réduction *' 
                                                : formData.type_promotion === 'montant_fixe'
                                                    ? 'Montant de la réduction *'
                                                    : formData.type_promotion === 'produit_gratuit'
                                                        ? 'ID du produit gratuit'
                                                        : 'Nombre de points bonus'}
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            {formData.type_promotion === 'pourcentage' && (
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Percent size={16} className="text-gray-400" />
                                                </div>
                                            )}
                                            <input
                                                type={formData.type_promotion === 'produit_gratuit' ? 'text' : 'number'}
                                                name="valeur"
                                                value={formData.valeur}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                    formData.type_promotion === 'pourcentage' ? 'pl-10' : ''
                                                }`}
                                                required
                                                min="0"
                                                step={formData.type_promotion === 'pourcentage' ? '0.01' : '1'}
                                            />
                                            {formData.type_promotion === 'pourcentage' && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Code promo *
                                        </label>
                                        <input
                                            type="text"
                                            name="code_promo"
                                            value={formData.code_promo}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Limite d'utilisations
                                        </label>
                                        <input
                                            type="number"
                                            name="limite_utilisations"
                                            value={formData.limite_utilisations}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Laissez vide pour illimité
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de début *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                name="date_debut"
                                                value={formData.date_debut}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date de fin *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                name="date_fin"
                                                value={formData.date_fin}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL de l'image
                                        </label>
                                        <input
                                            type="url"
                                            name="image_affiche"
                                            value={formData.image_affiche}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Conditions d'utilisation
                                        </label>
                                        <textarea
                                            name="conditions"
                                            value={formData.conditions}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Ex: Valable uniquement sur les produits sélectionnés, montant minimum d'achat de 30€..."
                                        />
                                    </div>

                                    <div className="col-span-2 flex items-center">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="est_active"
                                                name="est_active"
                                                type="checkbox"
                                                checked={formData.est_active}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <label htmlFor="est_active" className="ml-2 block text-sm text-gray-900">
                                            Promotion active
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {editingPromotion ? 'Mettre à jour' : 'Créer la promotion'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
