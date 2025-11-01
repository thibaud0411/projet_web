# 🚀 Démarrage Rapide - Frontend + Backend

## ⚡ Quick Start (5 minutes)

### 1. Backend (Terminal 1)
```bash
cd backend

# Si première fois:
composer install
php artisan key:generate
php artisan migrate:fresh --seed

# Démarrer serveur
php artisan serve
```
**Le backend est maintenant sur:** `http://localhost:8000`

### 2. Frontend (Terminal 2)
```bash
cd frontend

# Si première fois:
npm install

# Démarrer serveur
npm run dev
```
**Le frontend est maintenant sur:** `http://localhost:5173`

### 3. Accès Application
Ouvre ton navigateur: `http://localhost:5173`

---

## 🧪 Tester que Tout Fonctionne

### Option 1: Test Automatique
```bash
cd backend
php test_endpoints.php
```

### Option 2: Test Manuel
Ouvre: `http://localhost:8000/api/articles`

Si tu vois du JSON → ✅ Backend fonctionne!

---

## 📱 Naviguer dans l'Application

### Page d'Accueil
```
http://localhost:5173/
```

Depuis là, tu peux accéder à:
- **Espace Gérant** → `/manager`
- **Espace Employé** → `/employee`
- **Mode Démonstration** → `/demo`

### Accès Direct aux Pages
```
Admin:      http://localhost:5173/admin
Manager:    http://localhost:5173/manager
Employee:   http://localhost:5173/employee
Demo:       http://localhost:5173/demo
```

---

## 🔧 Configuration Actuelle

### Frontend
- ✅ **Sans authentification** (mode démo permanent)
- ✅ **Toutes les pages accessibles** directement
- ✅ **Pas de login requis**

### Backend
- ✅ **API REST complète**
- ✅ **Routes publiques** pour articles, catégories, événements
- ✅ **Routes protégées** pour gestion admin
- ✅ **Sanctum** pour authentification (optionnel)

---

## 📋 Comptes de Test (Si besoin backend)

| Email | Password | Rôle |
|-------|----------|------|
| admin@test.com | password | Administrateur |
| gerant@test.com | password | Gérant |
| employe@test.com | password | Employé |
| etudiant@test.com | password | Étudiant |

---

## 🗺️ Structure du Projet

```
projet_web/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/  # Contrôleurs API
│   │   └── Models/            # Modèles Eloquent
│   ├── database/
│   │   ├── migrations/        # Migrations DB
│   │   └── seeders/           # Données de test
│   ├── routes/
│   │   └── api.php            # Routes API
│   └── .env                   # Configuration
│
└── frontend/                   # React + TypeScript
    ├── src/
    │   ├── pages/             # Pages de l'application
    │   │   ├── Dashboard.tsx  # Admin dashboard
    │   │   ├── Menu.tsx       # Gestion menu
    │   │   ├── Orders.tsx     # Gestion commandes
    │   │   └── ...
    │   ├── components/        # Composants réutilisables
    │   │   └── layout/        # Layouts (Admin, Manager, Employee)
    │   ├── api/               # Configuration API
    │   └── App.tsx            # Point d'entrée
    └── package.json

```

---

## 🔗 Endpoints API Principaux

### Articles & Menu
```
GET  /api/articles              # Liste articles
GET  /api/categories-list       # Liste catégories
```

### Admin
```
GET  /api/admin/statistics      # Stats dashboard
GET  /api/admin/employees       # Liste employés
GET  /api/admin/commandes-all   # Toutes commandes
```

### User
```
GET  /api/commandes             # Mes commandes
GET  /api/reclamations          # Mes réclamations
```

**Voir `BACKEND_CONFIG_COMPLETE.md` pour la liste complète!**

---

## ⚠️ Problèmes Courants

### Backend ne démarre pas
```bash
# Vérifier que PostgreSQL est démarré
# Vérifier .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
# Réinstaller dépendances
composer install
```

### Frontend ne se connecte pas au backend
```bash
# Vérifier que backend est sur http://localhost:8000
# Vérifier CORS dans backend/config/cors.php
# Redémarrer les deux serveurs
```

### Erreur 404 sur routes
```bash
# Backend: vérifier routes/api.php
php artisan route:list

# Frontend: vérifier src/App.tsx
```

### Base de données vide
```bash
cd backend
php artisan migrate:fresh --seed
```

---

## 📚 Documentation Complète

- **`BACKEND_CONFIG_COMPLETE.md`** - Tous les endpoints API
- **`AUTHCONTEXT_REMOVED.md`** - Info sur authentification désactivée
- **`LOGIN_REMOVED.md`** - Info sur login supprimé
- **`DEMO_MODE_FINAL.md`** - Guide du mode démo

---

## ✅ Checklist Démarrage

Avant de commencer à travailler:

- [ ] Backend démarré (`php artisan serve`)
- [ ] Frontend démarré (`npm run dev`)
- [ ] Database migrée et seedée
- [ ] Page `http://localhost:5173` s'affiche
- [ ] Test API `http://localhost:8000/api/articles` fonctionne
- [ ] Navigation entre les pages fonctionne

---

## 🎯 Prochaines Étapes

1. **Tester toutes les pages** pour voir lesquelles ont besoin de connexion backend
2. **Implémenter les appels API** dans les pages qui en ont besoin
3. **Ajouter la gestion d'erreurs** pour les requêtes API
4. **Tester avec données réelles** du backend

---

## 💡 Commandes Utiles

### Backend
```bash
# Voir toutes les routes
php artisan route:list

# Nettoyer cache
php artisan cache:clear
php artisan config:clear

# Reset database
php artisan migrate:fresh --seed

# Créer nouveau contrôleur
php artisan make:controller NomController
```

### Frontend
```bash
# Installer dépendances
npm install

# Build production
npm run build

# Preview build
npm run preview
```

---

## 🆘 Besoin d'Aide?

1. Vérifier les logs:
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Console navigateur (F12)

2. Vérifier les fichiers de documentation créés

3. Tester les endpoints avec:
   ```bash
   cd backend
   php test_endpoints.php
   ```

---

**Tout est configuré et prêt à utiliser!** 🎉

**URL de départ:** `http://localhost:5173/`
