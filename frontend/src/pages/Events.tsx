import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Plus, Search, Edit, Trash2, Users, Calendar as CalendarIcon, Trophy, MapPin } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event, EventFormData, EventStatus, EventType, Participation, EventStats } from '../types/event';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    titre: '',
    description: '',
    type_evenement: 'jeu',
    date_debut: '',
    date_fin: '',
    lieu: 'ZeDuc@Space',
    recompenses: '',
    limite_participants: '',
    image_affiche: '',
    est_actif: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (): Promise<void> => {
    try {
      interface ApiResponse {
        data?: Event[];
        [key: string]: any;
      }
      
      const response = await api.get<Event[] | ApiResponse>('/admin/evenements-admin');
      const responseData = response.data;
      const data = Array.isArray(responseData) 
        ? responseData 
        : Array.isArray(responseData?.data) 
          ? responseData.data 
          : [];

      // Normalize fields: backend uses image_url, nombre_participants_max
      const normalized = data.map((ev: any) => ({
        id: ev.id_evenement ?? ev.id ?? null,
        titre: ev.titre,
        description: ev.description,
        type_evenement: ev.type_evenement,
        date_debut: ev.date_debut,
        date_fin: ev.date_fin,
        lieu: ev.lieu || 'ZeDuc@Space',
        recompenses: ev.recompense_points || ev.recompenses || '',
        limite_participants: ev.nombre_participants_max || ev.limite_participants || '',
        image_affiche: ev.image_url || ev.image_affiche || '',
        est_actif: ev.est_actif ?? true,
        nombre_participants: ev.participations ? ev.participations.length : (ev.nombre_participants || 0),
        participations: ev.participations || [],
      }));

      setEvents(normalized);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: number): Promise<void> => {
    try {
      const response = await api.get<Event>(`/evenements/${eventId}`);
      setParticipants(response.data.participations || []);
      setShowParticipantsModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des participants');
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }

    try {
      const payload = {
        titre: formData.titre,
        description: formData.description,
        type_evenement: formData.type_evenement,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        lieu: formData.lieu,
        recompense_points: formData.recompenses,
        nombre_participants_max: formData.limite_participants || null,
        image_url: formData.image_affiche,
        est_actif: formData.est_actif,
      };

      if (editingEvent && editingEvent.id) {
        await api.put(`/admin/evenements-admin/${editingEvent.id}`, payload);
        toast.success('Événement modifié avec succès');
      } else {
        await api.post('/admin/evenements-admin', payload);
        toast.success('Événement créé avec succès');
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) return;

    try {
      await api.delete(`/admin/evenements-admin/${id}`);
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (event: Event): void => {
    setEditingEvent(event);
    setFormData({
      titre: event.titre,
      description: event.description || '',
      type_evenement: event.type_evenement,
      date_debut: format(new Date(event.date_debut), "yyyy-MM-dd'T'HH:mm"),
      date_fin: format(new Date(event.date_fin), "yyyy-MM-dd'T'HH:mm"),
      lieu: event.lieu || 'ZeDuc@Space',
      recompenses: event.recompenses || event.recompense_points || '',
      limite_participants: event.limite_participants?.toString() || '',
      image_affiche: event.image_affiche || event.image_url || '',
      est_actif: event.est_actif,
    });
    setShowModal(true);
  };

  const resetForm = (): void => {
    setEditingEvent(null);
    setFormData({
      titre: '',
      description: '',
      type_evenement: 'jeu',
      date_debut: '',
      date_fin: '',
      lieu: 'ZeDuc@Space',
      recompenses: '',
      limite_participants: '',
      image_affiche: '',
      est_actif: true,
    });
  };

  const getEventTypeLabel = (type: EventType): string => {
    const types: Record<EventType, string> = {
      jeu: 'Jeu',
      concours: 'Concours',
      soiree_thematique: 'Soirée thématique',
      match: 'Match',
      autre: 'Autre',
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: EventType): string => {
    const colors: Record<EventType, string> = {
      jeu: 'bg-purple-100 text-purple-800',
      concours: 'bg-blue-100 text-blue-800',
      soiree_thematique: 'bg-pink-100 text-pink-800',
      match: 'bg-green-100 text-green-800',
      autre: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventStatus = (event: Event): EventStatus => {
    const now = new Date();
    const start = new Date(event.date_debut);
    const end = new Date(event.date_fin);

    if (!event.est_actif) return { label: 'Inactif', color: 'bg-gray-500' };
    if (now < start) return { label: 'À venir', color: 'bg-yellow-500' };
    if (now >= start && now <= end) return { label: 'En cours', color: 'bg-green-500' };
    return { label: 'Terminé', color: 'bg-red-500' };
  };

  const filteredEvents = events.filter(event =>
    event.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats: EventStats[] = [
    { label: 'Total', count: events.length, color: 'bg-blue-500' },
    {
      label: 'En cours',
      count: events.filter(e => {
        const now = new Date();
        return new Date(e.date_debut) <= now && new Date(e.date_fin) >= now && e.est_actif;
      }).length,
      color: 'bg-green-500'
    },
    {
      label: 'À venir',
      count: events.filter(e => new Date(e.date_debut) > new Date() && e.est_actif).length,
      color: 'bg-yellow-500'
    },
    {
      label: 'Participants',
      count: events.reduce((sum, e) => sum + (e.nombre_participants || 0), 0),
      color: 'bg-purple-500'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
          <p className="text-gray-600 mt-1">
            Organisez des jeux, concours et événements pour vos clients
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
          Nouvel événement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <CalendarIcon className="text-white" size={20} />
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
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const status = getEventStatus(event);
          const participationRate = event.limite_participants && typeof event.limite_participants === 'number' && event.nombre_participants
            ? (event.nombre_participants / event.limite_participants) * 100
            : 0;

          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Event Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-200">
                {event.image_affiche ? (
                  <img
                    src={event.image_affiche}
                    alt={event.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="text-primary" size={64} />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`${status.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                    {status.label}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`${getEventTypeColor(event.type_evenement)} px-2 py-1 rounded-full text-xs font-semibold`}>
                    {getEventTypeLabel(event.type_evenement)}
                  </span>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {event.titre}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {event.description}
                </p>

                {/* Date & Location */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon size={16} className="text-primary" />
                    <span>
                      {format(new Date(event.date_debut), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-primary" />
                    <span>{event.lieu}</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      Participants
                    </span>
                    <span className="font-semibold">
                      {event.nombre_participants || 0}
                      {event.limite_participants && ` / ${event.limite_participants}`}
                    </span>
                  </div>
                  {event.limite_participants && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${participationRate >= 100 ? 'bg-red-500' :
                          participationRate >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(participationRate, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Rewards */}
                {event.recompenses && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Trophy size={12} className="text-yellow-600" />
                      Récompenses
                    </p>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {event.recompenses}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      if (event.id) {
                        fetchParticipants(event.id);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Users size={16} />
                    Voir participants
                  </Button>

                  <button
                    onClick={() => openEditModal(event)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Modifier l'événement"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => event.id && handleDelete(event.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    aria-label="Supprimer l'événement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Tournoi de billard"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Décrivez l'événement..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'événement *
                  </label>
                  <select
                    required
                    value={formData.type_evenement}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type_evenement: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="jeu">Jeu</option>
                    <option value="concours">Concours</option>
                    <option value="soiree_thematique">Soirée thématique</option>
                    <option value="match">Match</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lieu: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ZeDuc@Space"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de début *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date_debut}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de fin *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date_fin}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite de participants (optionnel)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limite_participants}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, limite_participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Illimité si vide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Récompenses (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.recompenses}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, recompenses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: 100 points de fidélité"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.image_affiche}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image_affiche: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="est_actif"
                    checked={formData.est_actif}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, est_actif: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="est_actif" className="ml-2 block text-sm text-gray-700">
                    Événement actif
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  {editingEvent ? 'Enregistrer les modifications' : 'Créer l\'événement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Participants - {selectedEvent.titre}
              </h2>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((participation) => (
                    <div key={participation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {participation.utilisateur.prenom} {participation.utilisateur.nom}
                        </p>
                        <p className="text-sm text-gray-500">{participation.utilisateur.email}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        Inscrit le {format(new Date(participation.date_inscription), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun participant pour le moment</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t flex justify-end">
              <Button
                onClick={() => setShowParticipantsModal(false)}
                variant="outline"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
