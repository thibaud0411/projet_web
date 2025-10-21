import { useState, useEffect } from 'react';
import { Save, Clock, DollarSign, Gift, Users, Settings as SettingsIcon } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        nom_restaurant: '',
        primary_color: '',
        secondary_color: '',
        frais_livraison: '',
        montant_min_livraison: '',
    });

    // Loyalty Settings
    const [loyaltySettings, setLoyaltySettings] = useState({
        taux_conversion_points: '',
        points_pour_reduction: '',
        valeur_reduction: '',
        points_parrainage: '',
        duree_validite_points: '',
    });

    // Opening Hours
    const [horaires, setHoraires] = useState([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [settingsRes, horairesRes] = await Promise.all([
                api.get('/admin/settings'),
                api.get('/admin/settings/horaires')
            ]);

            // Map settings to state
            const settings = settingsRes.data.reduce((acc, setting) => {
                acc[setting.cle] = setting.valeur;
                return acc;
            }, {});

            setGeneralSettings({
                nom_restaurant: settings.nom_restaurant || '',
                primary_color: settings.primary_color || '#cfbd97',
                secondary_color: settings.secondary_color || '#000000',
                frais_livraison: settings.frais_livraison || '',
                montant_min_livraison: settings.montant_min_livraison || '',
            });

            setLoyaltySettings({
                taux_conversion_points: settings.taux_conversion_points || '',
                points_pour_reduction: settings.points_pour_reduction || '',
                valeur_reduction: settings.valeur_reduction || '',
                points_parrainage: settings.points_parrainage || '',
                duree_validite_points: settings.duree_validite_points || '',
            });

            setHoraires(horairesRes.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const saveGeneralSettings = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/admin/settings', {
                settings: Object.entries(generalSettings).map(([key, value]) => ({
                    cle: key,
                    valeur: value,
                }))
            });
            toast.success('Paramètres généraux enregistrés');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const saveLoyaltySettings = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/admin/settings', {
                settings: Object.entries(loyaltySettings).map(([key, value]) => ({
                    cle: key,
                    valeur: value,
                }))
            });
            toast.success('Paramètres de fidélité enregistrés');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const saveHoraires = async () => {
        setSaving(true);

        try {
            await api.put('/admin/settings/horaires', { horaires });
            toast.success('Horaires enregistrés');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const updateHoraire = (index, field, value) => {
        const newHoraires = [...horaires];
        newHoraires[index] = {
            ...newHoraires[index],
            [field]: value,
        };
        setHoraires(newHoraires);
    };

    const tabs = [
        { id: 'general', label: 'Général', icon: SettingsIcon },
        { id: 'loyalty', label: 'Fidélité', icon: Gift },
        { id: 'hours', label: 'Horaires', icon: Clock },
    ];

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
                <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'application</h1>
                <p className="text-gray-600 mt-1">
                    Configurez les paramètres globaux de votre restaurant
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <form onSubmit={saveGeneralSettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du restaurant
                                    </label>
                                    <input
                                        type="text"
                                        value={generalSettings.nom_restaurant}
                                        onChange={(e) => setGeneralSettings({
                                            ...generalSettings,
                                            nom_restaurant: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="ZeDuc@Space - Mon Miam Miam"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleur principale
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={generalSettings.primary_color}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                primary_color: e.target.value
                                            })}
                                            className="h-10 w-20 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={generalSettings.primary_color}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                primary_color: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                            placeholder="#cfbd97"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleur secondaire
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={generalSettings.secondary_color}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                secondary_color: e.target.value
                                            })}
                                            className="h-10 w-20 rounded border border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={generalSettings.secondary_color}
                                            onChange={(e) => setGeneralSettings({
                                                ...generalSettings,
                                                secondary_color: e.target.value
                                            })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <DollarSign size={16} className="inline mr-1" />
                                        Frais de livraison (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={generalSettings.frais_livraison}
                                        onChange={(e) => setGeneralSettings({
                                            ...generalSettings,
                                            frais_livraison: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <DollarSign size={16} className="inline mr-1" />
                                        Montant minimum pour livraison (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={generalSettings.montant_min_livraison}
                                        onChange={(e) => setGeneralSettings({
                                            ...generalSettings,
                                            montant_min_livraison: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="2000"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={saving}
                                    className="flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Enregistrer les paramètres généraux
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Loyalty Settings Tab */}
                    {activeTab === 'loyalty' && (
                        <form onSubmit={saveLoyaltySettings} className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Comment ça marche :</strong> Les clients gagnent des points à chaque commande.
                                    Ces points peuvent être utilisés pour obtenir des réductions.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Taux de conversion (FCFA pour 1 point)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={loyaltySettings.taux_conversion_points}
                                        onChange={(e) => setLoyaltySettings({
                                            ...loyaltySettings,
                                            taux_conversion_points: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="1000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ex: 1000 FCFA dépensés = 1 point
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points nécessaires pour une réduction
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={loyaltySettings.points_pour_reduction}
                                        onChange={(e) => setLoyaltySettings({
                                            ...loyaltySettings,
                                            points_pour_reduction: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="15"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nombre de points à échanger
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valeur de la réduction (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={loyaltySettings.valeur_reduction}
                                        onChange={(e) => setLoyaltySettings({
                                            ...loyaltySettings,
                                            valeur_reduction: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="1000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Montant de la réduction obtenue
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Users size={16} className="inline mr-1" />
                                        Points de parrainage
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={loyaltySettings.points_parrainage}
                                        onChange={(e) => setLoyaltySettings({
                                            ...loyaltySettings,
                                            points_parrainage: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Points attribués au parrain
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Durée de validité des points (mois)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={loyaltySettings.duree_validite_points}
                                        onChange={(e) => setLoyaltySettings({
                                            ...loyaltySettings,
                                            duree_validite_points: e.target.value
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="12"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Période avant expiration des points
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Aperçu du système</h4>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        ✓ Un client qui dépense <strong>{loyaltySettings.taux_conversion_points || 1000} FCFA</strong> gagne <strong>1 point</strong>
                                    </p>
                                    <p>
                                        ✓ Avec <strong>{loyaltySettings.points_pour_reduction || 15} points</strong>, il obtient <strong>{loyaltySettings.valeur_reduction || 1000} FCFA</strong> de réduction
                                    </p>
                                    <p>
                                        ✓ Un parrain reçoit <strong>{loyaltySettings.points_parrainage || 50} points</strong> quand son filleul fait sa première commande
                                    </p>
                                    <p>
                                        ✓ Les points expirent après <strong>{loyaltySettings.duree_validite_points || 12} mois</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={saving}
                                    className="flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Enregistrer les paramètres de fidélité
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Opening Hours Tab */}
                    {activeTab === 'hours' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>⏰ Horaires d'ouverture :</strong> Définissez les horaires pour chaque jour de la semaine.
                                    Les clients pourront voir ces informations sur l'application.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {horaires.map((horaire, index) => (
                                    <div key={horaire.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900 capitalize">
                                                    {horaire.jour_semaine}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    Ouverture
                                                </label>
                                                <input
                                                    type="time"
                                                    value={horaire.heure_ouverture}
                                                    onChange={(e) => updateHoraire(index, 'heure_ouverture', e.target.value)}
                                                    disabled={horaire.est_ferme}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    Fermeture
                                                </label>
                                                <input
                                                    type="time"
                                                    value={horaire.heure_fermeture}
                                                    onChange={(e) => updateHoraire(index, 'heure_fermeture', e.target.value)}
                                                    disabled={horaire.est_ferme}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={horaire.est_ferme}
                                                        onChange={(e) => updateHoraire(index, 'est_ferme', e.target.checked)}
                                                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Fermé
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="primary"
                                    loading={saving}
                                    onClick={saveHoraires}
                                    className="flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Enregistrer les horaires
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <SettingsIcon className="text-white" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Paramètres généraux</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                        Configurez les informations de base de votre restaurant et les frais de livraison.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Gift className="text-white" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Programme de fidélité</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                        Définissez comment vos clients gagnent et utilisent leurs points de fidélité.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Clock className="text-white" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Horaires d'ouverture</h3>
                    </div>
                    <p className="text-sm text-gray-700">
                        Gérez les horaires d'ouverture pour chaque jour de la semaine.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;