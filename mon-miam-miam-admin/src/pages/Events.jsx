import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Calendar as CalendarIcon, Trophy, MapPin } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({
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

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const response = await api.get(`/admin/events/${eventId}/participants`);
      setParticipants(response.data);
      setShowParticipantsModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement des participants');
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
      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent.id}`, formData);
        toast.success('Événement modifié avec succès');
      } else {
        await api.post('/admin/events', formData);
        toast.success('Événement créé avec succès');
      }
      
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) return;
    
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      titre: event.titre,
      description: event.description || '',
      type_evenement: event.type_evenement,
      date_debut: format(new Date(event.date_debut), "yyyy-MM-dd'T'HH:mm"),
      date_fin: format(new Date(event.date_fin), "yyyy-MM-dd'T'HH:mm"),
      lieu: event.lieu || 'ZeDuc@Space',
      recompenses: event.recompenses || '',
      limite_participants: event.limite_participants || '',
      image_affiche: event.image_affiche || '',
      est_actif: event.est_actif,
    });
    setShowModal(true);
  };

  const resetForm = () => {
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

  const getEventTypeLabel = (type) => {
    const types = {
      jeu: 'Jeu',
      concours: 'Concours',
      soiree_thematique: 'Soirée thématique',
      match: 'Match',
      autre: 'Autre',
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      jeu: 'bg-purple-100 text-purple-800',
      concours: 'bg-blue-100 text-blue-800',
      soiree_thematique: 'bg-pink-100 text-pink-800',
      match: 'bg-green-100 text-green-800',
      autre: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.date_debut);
    const end = new Date(event.date_fin);
    
    if (!event.est_actif) return { label: 'Inactif', color: 'bg-gray-500' };
    if (now < start) return { label: 'À venir', color: 'bg-yellow-500' };
    if (now >= start && now <= end) return { label: 'En cours', color: 'bg-