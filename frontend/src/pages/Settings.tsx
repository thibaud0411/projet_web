import { useState, useEffect, ChangeEvent } from 'react';
import { Save, Clock, Gift, Settings as SettingsIcon } from 'lucide-react';
import { GeneralSettings, LoyaltySettings, Horaire, SettingsResponse, TabItem } from '../types/settings';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Settings() {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('general');

    // General Settings
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        nom_restaurant: '',
        primary_color: '#cfbd97',
        secondary_color: '#000000',
        frais_livraison: '',
        montant_min_livraison: '',
    });

    // Loyalty Settings
    const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({
        taux_conversion_points: '',
        points_pour_reduction: '',
        valeur_reduction: '',
        points_parrainage: '',
        duree_validite_points: '',
    });

    // Opening Hours
    const [horaires, setHoraires] = useState<Horaire[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async (): Promise<void> => {
        try {
            const [settingsRes, horairesRes] = await Promise.all([
                api.get<SettingsResponse>('/admin/settings'),
                api.get<Horaire[]>('/admin/settings/horaires')
            ]);

            // Map settings to state
            const settings = settingsRes.data.settings.reduce((acc: Record<string, string>, setting) => {
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
            console.error('Error fetching settings:', error);
            toast.error('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const saveGeneralSettings = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/admin/settings', {
                settings: Object.entries(generalSettings).map(([key, value]) => ({
                    cle: key,
                    valeur: value.toString(),
                }))
            });
            toast.success('Paramètres généraux enregistrés');
        } catch (error) {
            console.error('Error saving general settings:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const saveLoyaltySettings = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/admin/settings', {
                settings: Object.entries(loyaltySettings).map(([key, value]) => ({
                    cle: key,
                    valeur: value.toString(),
                }))
            });
            toast.success('Paramètres de fidélité enregistrés');
        } catch (error) {
            console.error('Error saving loyalty settings:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const saveHoraires = async (): Promise<void> => {
        setSaving(true);

        try {
            await api.put('/admin/settings/horaires', { horaires });
            toast.success('Horaires enregistrés');
        } catch (error) {
            console.error('Error saving opening hours:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const updateHoraire = (index: number, field: keyof Horaire, value: string | boolean): void => {
        const newHoraires = [...horaires];
        newHoraires[index] = {
            ...newHoraires[index],
            [field]: value,
        };
        setHoraires(newHoraires);
    };

    const handleGeneralSettingChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLoyaltySettingChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setLoyaltySettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleColorChange = (name: 'primary_color' | 'secondary_color', value: string): void => {
        setGeneralSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const tabs: TabItem[] = [
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
                                        name="nom_restaurant"
                                        value={generalSettings.nom_restaurant}
                                        onChange={handleGeneralSettingChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleur principale
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={generalSettings.primary_color}
                                            onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer"
                                        />
                                        <span>{generalSettings.primary_color}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleur secondaire
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={generalSettings.secondary_color}
                                            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                            className="h-10 w-16 rounded cursor-pointer"
                                        />
                                        <span>{generalSettings.secondary_color}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frais de livraison (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="frais_livraison"
                                        value={generalSettings.frais_livraison}
                                        onChange={handleGeneralSettingChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Montant minimum de livraison (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="montant_min_livraison"
                                        value={generalSettings.montant_min_livraison}
                                        onChange={handleGeneralSettingChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-4 w-4" />
                                            Enregistrer les modifications
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Loyalty Settings Tab */}
                    {activeTab === 'loyalty' && (
                        <form onSubmit={saveLoyaltySettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Taux de conversion (€ → points)
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">1€ =</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="taux_conversion_points"
                                            value={loyaltySettings.taux_conversion_points}
                                            onChange={handleLoyaltySettingChange}
                                            min="0"
                                            step="1"
                                            className="pl-16 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">points</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points nécessaires pour une réduction
                                    </label>
                                    <input
                                        type="number"
                                        name="points_pour_reduction"
                                        value={loyaltySettings.points_pour_reduction}
                                        onChange={handleLoyaltySettingChange}
                                        min="0"
                                        step="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valeur de la réduction (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="valeur_reduction"
                                        value={loyaltySettings.valeur_reduction}
                                        onChange={handleLoyaltySettingChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points offerts pour parrainage
                                    </label>
                                    <input
                                        type="number"
                                        name="points_parrainage"
                                        value={loyaltySettings.points_parrainage}
                                        onChange={handleLoyaltySettingChange}
                                        min="0"
                                        step="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Durée de validité des points (jours)
                                    </label>
                                    <input
                                        type="number"
                                        name="duree_validite_points"
                                        value={loyaltySettings.duree_validite_points}
                                        onChange={handleLoyaltySettingChange}
                                        min="1"
                                        step="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-4 w-4" />
                                            Enregistrer les modifications
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Opening Hours Tab */}
                    {activeTab === 'hours' && (
                        <div className="space-y-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jour
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Midi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Soir
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fermé
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {horaires.map((horaire, index) => (
                                            <tr key={horaire.jour}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {horaire.jour}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="time"
                                                            value={horaire.ouverture_midi || ''}
                                                            onChange={(e) => updateHoraire(index, 'ouverture_midi', e.target.value)}
                                                            disabled={horaire.est_ferme}
                                                            className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                                                        />
                                                        <span className="self-center">-</span>
                                                        <input
                                                            type="time"
                                                            value={horaire.fermeture_midi || ''}
                                                            onChange={(e) => updateHoraire(index, 'fermeture_midi', e.target.value)}
                                                            disabled={horaire.est_ferme}
                                                            className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="time"
                                                            value={horaire.ouverture_soir || ''}
                                                            onChange={(e) => updateHoraire(index, 'ouverture_soir', e.target.value)}
                                                            disabled={horaire.est_ferme}
                                                            className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                                                        />
                                                        <span className="self-center">-</span>
                                                        <input
                                                            type="time"
                                                            value={horaire.fermeture_soir || ''}
                                                            onChange={(e) => updateHoraire(index, 'fermeture_soir', e.target.value)}
                                                            disabled={horaire.est_ferme}
                                                            className="border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={horaire.est_ferme}
                                                        onChange={(e) => updateHoraire(index, 'est_ferme', e.target.checked)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    type="button"
                                    onClick={saveHoraires}
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="-ml-1 mr-2 h-4 w-4" />
                                            Enregistrer les horaires
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
