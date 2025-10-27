import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Percent } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [formData, setFormData] = useState({
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

    const fetchPromotions = async () => {
        try {
            // Backend admin route is /admin/promotions-admin and returns paginated data
            const response = await api.get('/admin/promotions-admin');
            const data = Array.isArray(response.data) ? response.data : response.data.data ?? [];

            const normalized = data.map(p => ({
                id: p.id_promotion ?? p.id ?? null,
                titre: p.titre,
                description: p.description,
                type_promotion: p.type_promotion || (p.reduction ? 'pourcentage' : 'montant_fixe'),
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
            toast.error('Erreur lors du chargement des promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates
        if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
            toast.error('La date de fin doit être après la date de début');
            return;
        }

        try {
            if (editingPromotion) {
                // Map frontend form to backend expected fields
                const payload = {
                    titre: formData.titre,
                    description: formData.description,
                    code_promo: formData.code_promo,
                    date_debut: formData.date_debut,
                    date_fin: formData.date_fin,
                    limite_utilisations: formData.limite_utilisations || null,
                    image_url: formData.image_affiche,
                    active: formData.est_active,
                };
                if (formData.type_promotion === 'pourcentage') payload.reduction = formData.valeur;
                if (formData.type_promotion === 'montant_fixe') payload.montant_reduction = formData.valeur;

                await api.put(`/admin/promotions-admin/${editingPromotion.id}`, payload);
                toast.success('Promotion modifiée avec succès');
            } else {
                const payload = {
                    titre: formData.titre,
                    description: formData.description,
                    code_promo: formData.code_promo,
                    date_debut: formData.date_debut,
                    date_fin: formData.date_fin,
                    limite_utilisations: formData.limite_utilisations || null,
                    image_url: formData.image_affiche,
                    active: formData.est_active,
                };
                if (formData.type_promotion === 'pourcentage') payload.reduction = formData.valeur;
                if (formData.type_promotion === 'montant_fixe') payload.montant_reduction = formData.valeur;

                await api.post('/admin/promotions-admin', payload);
                toast.success('Promotion créée avec succès');
            }

            setShowModal(false);
            resetForm();
            fetchPromotions();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion?')) return;

        try {
            await api.delete(`/admin/promotions-admin/${id}`);
            toast.success('Promotion supprimée avec succès');
            fetchPromotions();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const togglePromotion = async (promotion) => {
        try {
            // Backend expects 'active'
            await api.patch(`/admin/promotions-admin/${promotion.id}`, {
                active: !promotion.est_active
            });
            toast.success('Statut modifié avec succès');
            fetchPromotions();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la modification');
        }
    };

    const openEditModal = (promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            titre: promotion.titre,
            description: promotion.description || '',
            type_promotion: promotion.type_promotion,
            valeur: promotion.valeur,
            code_promo: promotion.code_promo || '',
            date_debut: promotion.date_debut,
            date_fin: promotion.date_fin,
            conditions: promotion.conditions || '',
            limite_utilisations: promotion.limite_utilisations || '',
            image_affiche: promotion.image_affiche || '',
            est_active: promotion.est_active,
        });
        setShowModal(true);
    };

    const resetForm = () => {
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

    const getPromotionTypeLabel = (type) => {
        const types = {
            pourcentage: 'Pourcentage',
            montant_fixe: 'Montant fixe',
            produit_gratuit: 'Produit gratuit',
            points_bonus: 'Points bonus',
        };
        return types[type] || type;
    };

    const getPromotionTypeIcon = (type) => {
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
                return <Percent size={16} />;
        }
    };

    const isPromotionActive = (promo) => {
        const now = new Date();
        const start = new Date(promo.date_debut);
        const end = new Date(promo.date_fin);
        return promo.est_active && now >= start && now <= end;
    };

    const filteredPromotions = promotions.filter(promo =>
        promo.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.code_promo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des promotions</h1>
                    <p className="text-gray-600 mt-1">
                        Créez et gérez les promotions et codes promo
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nouvelle promotion
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: promotions.length, color: 'bg-blue-500' },
                    { label: 'Actives', count: promotions.filter(p => isPromotionActive(p)).length, color: 'bg-green-500' },
                    { label: 'Programmées', count: promotions.filter(p => new Date(p.date_debut) > new Date()).length, color: 'bg-yellow-500' },
                    { label: 'Expirées', count: promotions.filter(p => new Date(p.date_fin) < new Date()).length, color: 'bg-red-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
                        <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                            <Percent className="text-white" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une promotion..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((promo) => (
                    <div key={promo.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Promotion Image */}
                        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
                            {promo.image_affiche ? (
                                <img
                                    src={promo.image_affiche}
                                    alt={promo.titre}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Percent className="text-primary" size={48} />
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPromotionActive(promo)
                                    ? 'bg-green-500 text-white'
                                    : new Date(promo.date_debut) > new Date()
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}>
                                    {isPromotionActive(promo) ? 'Active' :
                                        new Date(promo.date_debut) > new Date() ? 'Programmée' : 'Expirée'}
                                </span>
                            </div>
                        </div>

                        {/* Promotion Info */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                        {promo.titre}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                            {getPromotionTypeIcon(promo.type_promotion)}
                                            {getPromotionTypeLabel(promo.type_promotion)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {promo.description}
                            </p>

                            {/* Promo Value */}
                            <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Valeur</span>
                                <span className="text-xl font-bold text-primary">
                                    {promo.type_promotion === 'pourcentage' ? `${promo.valeur}%` :
                                        promo.type_promotion === 'montant_fixe' ? `${promo.valeur} FCFA` :
                                            promo.type_promotion === 'points_bonus' ? `${promo.valeur} pts` :
                                                'N/A'}
                                </span>
                            </div>

                            {/* Code Promo */}
                            {promo.code_promo && (
                                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Code promo</p>
                                    <p className="font-mono font-bold text-blue-600 text-sm">
                                        {promo.code_promo}
                                    </p>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar size={14} />
                                <span>
                                    {format(new Date(promo.date_debut), 'dd/MM/yyyy', { locale: fr })} - {' '}
                                    {format(new Date(promo.date_fin), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                            </div>

                            {/* Usage Stats */}
                            {promo.limite_utilisations && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Utilisations</span>
                                        <span>{promo.nombre_utilisations || 0} / {promo.limite_utilisations}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(((promo.nombre_utilisations || 0) / promo.limite_utilisations) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t">
                                <button
                                    onClick={() => togglePromotion(promo)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${promo.est_active
                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {promo.est_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                    <span className="text-sm font-medium">
                                        {promo.est_active ? 'Activée' : 'Désactivée'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => openEditModal(promo)}
                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>

                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPromotions.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucune promotion trouvée</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.titre}
                                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Ex: Réduction de rentrée"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Décrivez la promotion..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de promotion *
                                    </label>
                                    <select
                                        required
                                        value={formData.type_promotion}
                                        onChange={(e) => setFormData({ ...formData, type_promotion: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="pourcentage">Pourcentage</option>
                                        <option value="montant_fixe">Montant fixe</option>
                                        <option value="produit_gratuit">Produit gratuit</option>
                                        <option value="points_bonus">Points bonus</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valeur *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.valeur}
                                        onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder={formData.type_promotion === 'pourcentage' ? '10' : '5000'}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code promo (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code_promo}
                                        onChange={(e) => setFormData({ ...formData, code_promo: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                        placeholder="PROMO2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de début *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date_debut}
                                        onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de fin *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date_fin}
                                        onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Limite d'utilisations
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.limite_utilisations}
                                        onChange={(e) => setFormData({ ...formData, limite_utilisations: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Laisser vide pour illimité"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL de l'affiche
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image_affiche}
                                        onChange={(e) => setFormData({ ...formData, image_affiche: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="https://example.com/promo.jpg"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Conditions d'utilisation
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={formData.conditions}
                                        onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Ex: Valable uniquement sur les commandes supérieures à 5000 FCFA"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.est_active}
                                            onChange={(e) => setFormData({ ...formData, est_active: e.target.checked })}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Promotion active
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" variant="primary" className="flex-1">
                                    {editingPromotion ? 'Modifier' : 'Créer'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;