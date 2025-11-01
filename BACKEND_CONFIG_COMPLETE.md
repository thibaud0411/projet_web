# 🔧 Configuration Complète du Backend - Guide

## 📋 Vue d'Ensemble

Le backend Laravel est configuré avec:
- ✅ API RESTful complète
- ✅ Routes publiques et protégées
- ✅ Contrôleurs pour toutes les fonctionnalités
- ✅ Middleware d'authentification (désactivable pour démo)

---

## 🌐 Routes API Disponibles

### Base URL
```
http://localhost:8000/api
```

---

## 📂 ROUTES PUBLIQUES (Sans authentification)

### Articles & Catégories
```http
GET  /api/articles                          # Liste des articles
GET  /api/articles/{id}                     # Détail d'un article
GET  /api/categories-list                   # Liste des catégories
GET  /api/categories-list/{id}              # Détail d'une catégorie
GET  /api/categories-list/{id}/articles     # Articles d'une catégorie
```

### Promotions
```http
GET  /api/promotions                        # Liste des promotions actives
POST /api/promotions/validate-code          # Valider un code promo
```

### Événements
```http
GET  /api/evenements                        # Liste des événements
GET  /api/evenements/{id}                   # Détail d'un événement
```

---

## 🔐 ROUTES AUTHENTIFIÉES (Requis: Token Sanctum)

### User Info
```http
GET  /api/user                              # Infos utilisateur connecté
```

### Dashboard
```http
GET  /api/dashboard-stats                   # Stats dashboard employé
GET  /api/dashboard/stats                   # Stats dashboard principal
```

---

## 👤 ROUTES CLIENT (Tous utilisateurs authentifiés)

### Commandes (Orders)
```http
GET    /api/commandes                       # Liste mes commandes
POST   /api/commandes                       # Créer une commande
GET    /api/commandes/{id}                  # Détail d'une commande
PUT    /api/commandes/{id}                  # Modifier une commande
DELETE /api/commandes/{id}                  # Supprimer une commande
POST   /api/commandes/{id}/cancel           # Annuler une commande
```

### Commentaires (Reviews)
```http
GET    /api/commentaires                    # Liste mes commentaires
POST   /api/commentaires                    # Créer un commentaire
GET    /api/commentaires/{id}               # Détail d'un commentaire
PUT    /api/commentaires/{id}               # Modifier un commentaire
DELETE /api/commentaires/{id}               # Supprimer un commentaire
```

### Parrainages (Referrals)
```http
GET    /api/parrainages                     # Liste mes parrainages
POST   /api/parrainages                     # Créer un parrainage
GET    /api/parrainages/{id}                # Détail d'un parrainage
PUT    /api/parrainages/{id}                # Modifier un parrainage
DELETE /api/parrainages/{id}                # Supprimer un parrainage
```

### Participations (Events)
```http
GET    /api/participations                  # Liste mes participations
POST   /api/participations                  # Participer à un événement
GET    /api/participations/{id}             # Détail d'une participation
PUT    /api/participations/{id}             # Modifier une participation
DELETE /api/participations/{id}             # Supprimer une participation
POST   /api/participations/{id}/mark-winner # Marquer comme gagnant
```

### Réclamations (Complaints)
```http
GET    /api/reclamations                    # Liste mes réclamations
POST   /api/reclamations                    # Créer une réclamation
GET    /api/reclamations/{id}               # Détail d'une réclamation
PUT    /api/reclamations/{id}               # Modifier une réclamation
DELETE /api/reclamations/{id}               # Supprimer une réclamation
```

### Statistiques Utilisateur
```http
GET    /api/utilisateurs/{id}/statistics    # Stats d'un utilisateur
POST   /api/utilisateurs/{id}/points        # Mettre à jour les points
```

---

## 👨‍💼 ROUTES ADMIN (Admin & Gérant uniquement)

Préfixe: `/api/admin`

### Dashboard & Statistics
```http
GET  /api/admin/statistics                  # Stats dashboard admin
GET  /api/admin/revenue                     # Revenus
```

### Gestion Employés
```http
GET    /api/admin/employees                 # Liste employés
POST   /api/admin/employees                 # Créer employé (admin only)
GET    /api/admin/employees/{id}            # Détail employé
PUT    /api/admin/employees/{id}            # Modifier employé (admin only)
DELETE /api/admin/employees/{id}            # Supprimer employé (admin only)
PATCH  /api/admin/employees/{id}/status     # Changer statut employé
```

### Gestion Articles
```http
POST   /api/admin/articles                  # Créer article
PUT    /api/admin/articles/{id}             # Modifier article
DELETE /api/admin/articles/{id}             # Supprimer article
```

### Gestion Catégories
```http
POST   /api/admin/categories                # Créer catégorie
PUT    /api/admin/categories/{id}           # Modifier catégorie
DELETE /api/admin/categories/{id}           # Supprimer catégorie
```

### Gestion Commandes
```http
GET   /api/admin/commandes-all              # Toutes les commandes
PATCH /api/admin/commandes/{id}             # Modifier statut commande
```

### Gestion Livraisons
```http
GET    /api/admin/livraisons                # Liste livraisons
POST   /api/admin/livraisons                # Créer livraison
GET    /api/admin/livraisons/{id}           # Détail livraison
PUT    /api/admin/livraisons/{id}           # Modifier livraison
DELETE /api/admin/livraisons/{id}           # Supprimer livraison
PATCH  /api/admin/livraisons/{id}/status    # Changer statut livraison
```

### Gestion Paiements
```http
GET    /api/admin/paiements                 # Liste paiements
POST   /api/admin/paiements                 # Créer paiement
GET    /api/admin/paiements/{id}            # Détail paiement
PUT    /api/admin/paiements/{id}            # Modifier paiement
DELETE /api/admin/paiements/{id}            # Supprimer paiement
POST   /api/admin/paiements/{id}/validate   # Valider paiement
```

### Gestion Promotions
```http
GET    /api/admin/promotions-admin          # Liste promotions
POST   /api/admin/promotions-admin          # Créer promotion
PUT    /api/admin/promotions-admin/{id}     # Modifier promotion
DELETE /api/admin/promotions-admin/{id}     # Supprimer promotion
POST   /api/admin/promotions-admin/{id}/increment # Incrémenter usage
```

### Gestion Événements
```http
GET    /api/admin/evenements-admin          # Liste événements
POST   /api/admin/evenements-admin          # Créer événement
PUT    /api/admin/evenements-admin/{id}     # Modifier événement
DELETE /api/admin/evenements-admin/{id}     # Supprimer événement
```

### Gestion Réclamations
```http
GET  /api/admin/reclamations-all            # Toutes les réclamations
POST /api/admin/reclamations/{id}/assign    # Assigner réclamation
POST /api/admin/reclamations/{id}/resolve   # Résoudre réclamation
```

### Gestion Commentaires
```http
GET  /api/admin/commentaires-all                    # Tous les commentaires
POST /api/admin/commentaires/{id}/toggle-visibility # Changer visibilité
```

### Gestion Parrainages
```http
GET  /api/admin/parrainages-all                     # Tous les parrainages
POST /api/admin/parrainages/{id}/attribute-reward   # Attribuer récompense
```

### Gestion Utilisateurs
```http
GET    /api/admin/utilisateurs                      # Liste utilisateurs
POST   /api/admin/utilisateurs                      # Créer utilisateur
GET    /api/admin/utilisateurs/{id}                 # Détail utilisateur
PUT    /api/admin/utilisateurs/{id}                 # Modifier utilisateur
DELETE /api/admin/utilisateurs/{id}                 # Supprimer utilisateur
POST   /api/admin/utilisateurs/{id}/suspend         # Suspendre utilisateur
POST   /api/admin/utilisateurs/{id}/activate        # Activer utilisateur
```

### Gestion Rôles
```http
GET    /api/admin/roles                             # Liste rôles
POST   /api/admin/roles                             # Créer rôle
GET    /api/admin/roles/{id}                        # Détail rôle
PUT    /api/admin/roles/{id}                        # Modifier rôle
DELETE /api/admin/roles/{id}                        # Supprimer rôle
```

### Paramètres
```http
GET  /api/admin/settings                            # Liste paramètres
PUT  /api/admin/settings                            # Modifier paramètres
GET  /api/admin/settings/horaires                   # Horaires
PUT  /api/admin/settings/horaires                   # Modifier horaires
```

---

## 🗺️ Mapping Frontend → Backend

### Page Dashboard Admin (`/admin`)
**Endpoints utilisés:**
- `GET /api/admin/statistics` - Stats principales
- `GET /api/admin/revenue` - Revenus

### Page Employees (`/admin/employees`)
**Endpoints utilisés:**
- `GET /api/admin/employees` - Liste
- `POST /api/admin/employees` - Créer
- `PUT /api/admin/employees/{id}` - Modifier
- `DELETE /api/admin/employees/{id}` - Supprimer

### Page Menu (`/admin/menu`)
**Endpoints utilisés:**
- `GET /api/articles` - Liste articles
- `GET /api/categories-list` - Liste catégories
- `POST /api/admin/articles` - Créer article
- `PUT /api/admin/articles/{id}` - Modifier article
- `DELETE /api/admin/articles/{id}` - Supprimer article

### Page Orders (`/admin/orders`)
**Endpoints utilisés:**
- `GET /api/admin/commandes-all` - Toutes les commandes
- `PATCH /api/admin/commandes/{id}` - Modifier statut

### Page Promotions (`/admin/promotions`)
**Endpoints utilisés:**
- `GET /api/admin/promotions-admin` - Liste
- `POST /api/admin/promotions-admin` - Créer
- `PUT /api/admin/promotions-admin/{id}` - Modifier
- `DELETE /api/admin/promotions-admin/{id}` - Supprimer

### Page Events (`/admin/events`)
**Endpoints utilisés:**
- `GET /api/admin/evenements-admin` - Liste
- `POST /api/admin/evenements-admin` - Créer
- `PUT /api/admin/evenements-admin/{id}` - Modifier
- `DELETE /api/admin/evenements-admin/{id}` - Supprimer

### Page Complaints (`/admin/complaints`)
**Endpoints utilisés:**
- `GET /api/admin/reclamations-all` - Toutes les réclamations
- `POST /api/admin/reclamations/{id}/assign` - Assigner
- `POST /api/admin/reclamations/{id}/resolve` - Résoudre

### Page Settings (`/admin/settings`)
**Endpoints utilisés:**
- `GET /api/admin/settings` - Paramètres
- `PUT /api/admin/settings` - Modifier paramètres
- `GET /api/admin/settings/horaires` - Horaires
- `PUT /api/admin/settings/horaires` - Modifier horaires

---

## 🔧 Configuration Backend

### 1. Variables d'Environnement (`.env`)
```env
APP_NAME="Mon Miam Miam"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=miam_miam
DB_USERNAME=postgres
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

### 2. CORS Configuration (`config/cors.php`)
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 3. Démarrer le Backend
```bash
cd backend

# Installer dépendances
composer install

# Générer clé application
php artisan key:generate

# Lancer migrations
php artisan migrate

# Seed base de données
php artisan db:seed

# Démarrer serveur
php artisan serve
```

---

## 🧪 Tester les Endpoints

### Avec cURL (sans auth)
```bash
# Articles
curl http://localhost:8000/api/articles

# Catégories
curl http://localhost:8000/api/categories-list

# Promotions
curl http://localhost:8000/api/promotions
```

### Avec cURL (avec auth)
```bash
# 1. Login pour obtenir token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# 2. Utiliser le token
curl http://localhost:8000/api/admin/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Avec Postman
1. Créer collection "Mon Miam Miam"
2. Ajouter variable `base_url` = `http://localhost:8000/api`
3. Tester chaque endpoint
4. Pour routes protégées: Authorization → Bearer Token

---

## 🔑 Authentification Sanctum

### Headers Requis
```http
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Obtenir un Token
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password"
}

Response:
{
  "user": {...},
  "token": "1|abc123...",
  "message": "Connexion réussie"
}
```

---

## 📊 Format des Réponses

### Succès
```json
{
  "data": [...],
  "message": "Success"
}
```

### Erreur
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

---

## ✅ Checklist Configuration

- [ ] `.env` configuré correctement
- [ ] Base de données créée
- [ ] Migrations exécutées (`php artisan migrate`)
- [ ] Seeders exécutés (`php artisan db:seed`)
- [ ] Serveur démarré (`php artisan serve`)
- [ ] CORS configuré pour frontend
- [ ] Sanctum configuré
- [ ] Routes testées avec Postman/cURL

---

## 🚀 Commandes Utiles

```bash
# Cache clear
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Voir toutes les routes
php artisan route:list

# Créer contrôleur
php artisan make:controller NomController

# Créer modèle
php artisan make:model NomModele -m

# Créer seeder
php artisan make:seeder NomSeeder

# Reset base de données
php artisan migrate:fresh --seed
```

---

## 📝 Notes Importantes

### Mode Démo (Sans Auth)
Pour tester sans authentification:
1. Les routes publiques fonctionnent directement
2. Pour les routes protégées, il faut soit:
   - Désactiver le middleware auth dans `routes/api.php`
   - Ou toujours passer un token valide

### Production
Avant de déployer en production:
- ✅ Changer `APP_DEBUG=false`
- ✅ Utiliser HTTPS
- ✅ Configurer CORS correctement
- ✅ Utiliser vraies URLs dans `SANCTUM_STATEFUL_DOMAINS`
- ✅ Sécuriser les variables d'environnement

---

**Le backend est maintenant complètement configuré et prêt à utiliser!** 🎉
