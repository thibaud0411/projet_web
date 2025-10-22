// src/pages/Reclamations.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useApp } from '../context/AppContext';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';

// Styles
import '../styles/GlobalStyles.css';

const Reclamations = () => {
  const { claimsData, addNewClaim, updateClaims } = useApp();
  const [filteredData, setFilteredData] = useState([]);
  const [currentClaim, setCurrentClaim] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    date: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
    
    // Initialiser les données filtrées
    setFilteredData([...claimsData]);
  }, [claimsData]);

  useEffect(() => {
    // Appliquer les filtres et le tri
    applyFiltersAndSort();
  }, [filters, sortConfig, claimsData]);

  const applyFiltersAndSort = () => {
    let tempData = [...claimsData];
    
    // Appliquer le filtre de recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      tempData = tempData.filter(claim => 
        claim.student.toLowerCase().includes(searchTerm) ||
        claim.order.toLowerCase().includes(searchTerm) ||
        claim.subject.toLowerCase().includes(searchTerm) ||
        claim.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Appliquer le filtre de statut
    if (filters.status) {
      tempData = tempData.filter(claim => claim.status === filters.status);
    }
    
    // Appliquer le filtre de priorité
    if (filters.priority) {
      tempData = tempData.filter(claim => claim.priority === filters.priority);
    }
    
    // Appliquer le filtre de date
    if (filters.date) {
      tempData = tempData.filter(claim => claim.date === filters.date);
    }
    
    // Appliquer le tri
    tempData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredData(tempData);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      date: ''
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const changePage = (page) => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const showClaimDetails = (claimId) => {
    const claim = claimsData.find(c => c.id === claimId);
    if (claim) {
      setCurrentClaim(claim);
      setShowDetailsModal(true);
    }
  };

  const openReplyModal = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setShowReplyModal(true);
    }, 500);
  };

  const openReplyModalFromId = (claimId) => {
    const claim = claimsData.find(c => c.id === claimId);
    if (claim) {
      setCurrentClaim(claim);
      setShowReplyModal(true);
    }
  };

  const sendReply = () => {
    if (!replyMessage.trim() || !currentClaim) {
      showNotification('Veuillez saisir un message de réponse.', 'error');
      return;
    }

    // Mettre à jour les données dans le contexte global
    const updatedClaims = claimsData.map(claim => 
      claim.id === currentClaim.id 
        ? {
            ...claim,
            responses: [
              ...claim.responses,
              {
                sender: "Support Mon Miam Miam",
                message: replyMessage,
                time: new Date().toLocaleString('fr-FR')
              }
            ],
            status: claim.status === 'pending' ? 'in-progress' : claim.status
          }
        : claim
    );

    updateClaims(updatedClaims);
    showNotification(`Réponse envoyée à ${currentClaim.student} avec succès !`, 'success');
    setShowReplyModal(false);
    setReplyMessage('');
  };

  const changeStatus = (claimId) => {
    const statuses = ['pending', 'in-progress', 'resolved'];
    
    const updatedClaims = claimsData.map(claim => {
      if (claim.id === claimId) {
        const currentIndex = statuses.indexOf(claim.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return {
          ...claim,
          status: statuses[nextIndex]
        };
      }
      return claim;
    });

    updateClaims(updatedClaims);
    showNotification(`Statut de la réclamation #${String(claimId).padStart(3, '0')} mis à jour`, 'info');
  };

  const editClaim = (claimId) => {
    showNotification(`Modification de la réclamation #${String(claimId).padStart(3, '0')}`, 'warning');
  };

  const manualRefresh = () => {
    // Simuler l'ajout d'une nouvelle réclamation
    if (Math.random() > 0.7) {
      const newClaim = {
        id: claimsData.length + 1,
        student: "Nouveau Client",
        order: `#COR-2024-${String(claimsData.length + 1).padStart(2, '0')}`,
        subject: "Nouvelle réclamation test",
        description: "Ceci est une nouvelle réclamation simulée.",
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        responses: [],
        isNew: true
      };
      
      addNewClaim(newClaim);
      showNotification('Nouvelle réclamation reçue !', 'info');
    } else {
      showNotification('Données actualisées avec succès', 'success');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `reclamations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Export terminé avec succès', 'success');
  };

  const toggleAutoRefresh = (checked) => {
    setAutoRefresh(checked);
    showNotification(
      checked ? 'Actualisation automatique activée' : 'Actualisation automatique désactivée',
      checked ? 'info' : 'warning'
    );
  };

  // Utilitaires
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En Attente',
      'in-progress': 'En Cours',
      'resolved': 'Résolu'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return priorityMap[priority] || priority;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const showNotification = (message, type = 'info') => {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'custom-toast';
    
    const bgColor = {
      'success': 'bg-success',
      'warning': 'bg-warning',
      'error': 'bg-danger',
      'info': 'bg-primary'
    }[type] || 'bg-primary';

    const icon = {
      'success': 'check-circle',
      'warning': 'exclamation-triangle',
      'error': 'times-circle',
      'info': 'info-circle'
    }[type] || 'info-circle';

    toastContainer.innerHTML = `
      <div class="toast align-items-center text-white ${bgColor} border-0 show" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <i class="fas fa-${icon} me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;

    document.body.appendChild(toastContainer);

    setTimeout(() => {
      toastContainer.remove();
    }, 3000);
  };

  // Calculs pour l'affichage
  const totalClaims = claimsData.length;
  const pendingClaims = claimsData.filter(c => c.status === 'pending').length;
  const urgentClaims = claimsData.filter(c => c.priority === 'high').length;
  const notificationCount = pendingClaims;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'fas fa-sort';
    return sortConfig.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  return (
    <div className="App">
      <Header activePage="reclamations" notificationCount={notificationCount} />
      
      {/* Section principale */}
      <main className="main-content">
        <div className="container">
          {/* En-tête de la page */}
          <div className="mb-4" data-aos="fade-up">
            <h1 className="page-title">Gestion des Réclamations</h1>
            <p className="page-subtitle">Traitez et gérez les réclamations des clients en temps réel</p>
          </div>

          {/* Statistiques en temps réel */}
          <div className="live-stats" data-aos="fade-up" data-aos-delay="100">
            <div className="stat-card">
              <div className="stat-value">{totalClaims}</div>
              <div className="stat-label">Total Réclamations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{pendingClaims}</div>
              <div className="stat-label">En Attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{urgentClaims}</div>
              <div className="stat-label">Urgentes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">2.4h</div>
              <div className="stat-label">Temps Réponse Moyen</div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="d-flex justify-content-end mb-4" data-aos="fade-up" data-aos-delay="150">
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={exportData}>
                <i className="fas fa-download"></i> Exporter
              </button>
              <button className="btn btn-primary" onClick={manualRefresh}>
                <i className="fas fa-sync-alt"></i> Actualiser
              </button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="filters-section" data-aos="fade-up" data-aos-delay="200">
            <div className="filter-group">
              <div className="filter-item">
                <div className="filter-label">Recherche</div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher une réclamation..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="filter-item">
                <div className="filter-label">Statut</div>
                <select 
                  className="form-select" 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="resolved">Résolu</option>
                </select>
              </div>
              <div className="filter-item">
                <div className="filter-label">Priorité</div>
                <select 
                  className="form-select" 
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">Toutes les priorités</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>
              <div className="filter-item">
                <div className="filter-label">Date</div>
                <input 
                  type="date" 
                  className="form-control" 
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Affichage de {filteredData.length} réclamation{filteredData.length !== 1 ? 's' : ''}
              </small>
              <button className="btn btn-sm btn-outline-primary" onClick={clearFilters}>
                <i className="fas fa-times"></i> Effacer les filtres
              </button>
            </div>
          </div>

          {/* Section des réclamations */}
          <div className="section" data-aos="fade-up" data-aos-delay="250">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Réclamations Récentes</h2>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-primary">{totalClaims} réclamations</span>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => toggleAutoRefresh(e.target.checked)}
                  />
                  <label className="form-check-label">Actualisation auto</label>
                </div>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="claims-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')}>
                      ID <i className={getSortIcon('id')}></i>
                    </th>
                    <th onClick={() => handleSort('student')}>
                      Étudiant <i className={getSortIcon('student')}></i>
                    </th>
                    <th onClick={() => handleSort('order')}>
                      Commande <i className={getSortIcon('order')}></i>
                    </th>
                    <th onClick={() => handleSort('subject')}>
                      Sujet <i className={getSortIcon('subject')}></i>
                    </th>
                    <th onClick={() => handleSort('priority')}>
                      Priorité <i className={getSortIcon('priority')}></i>
                    </th>
                    <th onClick={() => handleSort('status')}>
                      Statut <i className={getSortIcon('status')}></i>
                    </th>
                    <th onClick={() => handleSort('date')}>
                      Date <i className={getSortIcon('date')}></i>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(claim => (
                    <tr key={claim.id} className="fade-in">
                      <td><strong>#{String(claim.id).padStart(3, '0')}</strong></td>
                      <td>{claim.student}</td>
                      <td>{claim.order}</td>
                      <td>{claim.subject}</td>
                      <td>
                        <span className={`priority priority-${claim.priority}`}>
                          {getPriorityText(claim.priority)}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={`status status-${claim.status}`}
                          onClick={() => changeStatus(claim.id)}
                        >
                          {getStatusText(claim.status)}
                        </span>
                      </td>
                      <td>{formatDate(claim.date)}</td>
                      <td className="actions">
                        <i 
                          className="fas fa-eye" 
                          title="Voir les détails" 
                          onClick={() => showClaimDetails(claim.id)}
                        ></i>
                        <i 
                          className="fas fa-reply" 
                          title="Répondre" 
                          onClick={() => openReplyModalFromId(claim.id)}
                        ></i>
                        <i 
                          className="fas fa-edit" 
                          title="Modifier" 
                          onClick={() => editClaim(claim.id)}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination des réclamations" className="mt-4">
                <ul className="pagination pagination-custom justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a className="page-link" href="#" onClick={() => changePage(currentPage - 1)}>
                      Précédent
                    </a>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                      <a className="page-link" href="#" onClick={() => changePage(page)}>
                        {page}
                      </a>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <a className="page-link" href="#" onClick={() => changePage(currentPage + 1)}>
                      Suivant
                    </a>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </main>

      {/* Modal de détails */}
      {showDetailsModal && currentClaim && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Détails de la Réclamation</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="claim-details">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="detail-item">
                        <div className="detail-label">ID Réclamation</div>
                        <div className="detail-value">#{String(currentClaim.id).padStart(3, '0')}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Étudiant</div>
                        <div className="detail-value">{currentClaim.student}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Commande</div>
                        <div className="detail-value">{currentClaim.order}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="detail-item">
                        <div className="detail-label">Statut</div>
                        <div className="detail-value">
                          <span className={`status status-${currentClaim.status}`}>
                            {getStatusText(currentClaim.status)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Priorité</div>
                        <div className="detail-value">
                          <span className={`priority priority-${currentClaim.priority}`}>
                            {getPriorityText(currentClaim.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Date</div>
                        <div className="detail-value">{formatDate(currentClaim.date)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Sujet</div>
                    <div className="detail-value">{currentClaim.subject}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Description</div>
                    <div className="detail-value">{currentClaim.description}</div>
                  </div>
                </div>

                <h6 className="text-primary mb-3">Historique des réponses</h6>
                <div className="response-history">
                  {currentClaim.responses.map((response, index) => (
                    <div key={index} className="response-item mb-3 p-3 bg-dark rounded">
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{response.sender}</strong>
                        <small className="text-muted">{response.time}</small>
                      </div>
                      <p className="mb-0">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fermer
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={openReplyModal}
                >
                  <i className="fas fa-reply"></i> Répondre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {showReplyModal && currentClaim && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Répondre à la réclamation</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowReplyModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Destinataire</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentClaim.student}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Sujet de la réclamation</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentClaim.subject}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Votre réponse</label>
                  <textarea 
                    className="form-control" 
                    rows="5" 
                    placeholder="Tapez votre message de réponse ici..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Aperçu de la réponse</label>
                  <div className="response-preview">
                    {replyMessage || 'Votre réponse apparaîtra ici...'}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowReplyModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={sendReply}
                >
                  <i className="fas fa-paper-plane"></i> Envoyer la réponse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Reclamations;