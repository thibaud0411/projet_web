# Mon Miam Miam - API Documentation

Base URL: `http://localhost:8000/api`

## Table of Contents
- [Authentication](#authentication)
- [Public Routes](#public-routes)
- [Customer Routes](#customer-routes-authenticated)
- [Admin Routes](#admin-routes)

---

## Authentication

### Register
**POST** `/register`

Creates a new user account.

**Request Body:**
```json
{
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "telephone": "string",
  "password": "string",
  "password_confirmation": "string",
  "role": "string (optional: administrateur|gerant|employe|etudiant)"
}
```

**Response:** `201 Created`
```json
{
  "user": { ...user object },
  "token": "Bearer token",
  "message": "Inscription réussie"
}
```

### Login
**POST** `/login`

Authenticates a user and returns a token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "user": { ...user object },
  "token": "Bearer token",
  "message": "Connexion réussie"
}
```

### Logout
**POST** `/logout` (Requires Authentication)

Revokes all user tokens.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Déconnexion réussie"
}
```

### Get Current User
**GET** `/user` (Requires Authentication)

Returns the authenticated user's information.

**Response:** `200 OK`

---

## Public Routes

### Articles

#### List Articles
**GET** `/articles`

Returns a paginated list of articles.

**Query Parameters:**
- `id_categorie` - Filter by category ID
- `disponible` - Filter by availability (0|1)
- `est_promotion` - Filter by promotion status (0|1)
- `search` - Search by name
- `per_page` - Items per page (default: 15)

**Response:** `200 OK` (Paginated)

#### Get Article
**GET** `/articles/{id}`

Returns a single article with its category.

**Response:** `200 OK`

### Categories

#### List Categories
**GET** `/categories-list`

Returns all categories ordered by display order.

**Query Parameters:**
- `active` - Filter by active status (0|1)

**Response:** `200 OK`

#### Get Category
**GET** `/categories-list/{id}`

Returns a single category.

**Response:** `200 OK`

#### Get Category with Articles
**GET** `/categories-list/{id}/articles`

Returns a category with all its articles.

**Response:** `200 OK`

### Promotions

#### List Promotions
**GET** `/promotions`

Returns promotions.

**Query Parameters:**
- `active` - Filter by active status
- `current` - Only current active promotions
- `upcoming` - Only upcoming promotions
- `code_promo` - Search by promo code

**Response:** `200 OK` (Paginated)

#### Validate Promo Code
**POST** `/promotions/validate-code`

Validates a promotional code.

**Request Body:**
```json
{
  "code_promo": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Code promo valide",
  "valid": true,
  "data": { ...promotion object }
}
```

### Events

#### List Events
**GET** `/evenements`

Returns events.

**Query Parameters:**
- `est_actif` - Filter by active status
- `type_evenement` - Filter by event type
- `upcoming` - Only upcoming events
- `ongoing` - Only ongoing events

**Response:** `200 OK` (Paginated)

#### Get Event
**GET** `/evenements/{id}`

Returns an event with participants.

**Response:** `200 OK`

---

## Customer Routes (Authenticated)

All these routes require authentication via Bearer token.

### Orders (Commandes)

#### List My Orders
**GET** `/commandes`

Returns authenticated user's orders.

**Response:** `200 OK` (Paginated)

#### Create Order
**POST** `/commandes`

Creates a new order.

**Request Body:**
```json
{
  "id_utilisateur": "integer",
  "montant_total": "decimal",
  "points_gagnes": "integer (optional)",
  "type_service": "string (sur_place|a_emporter|livraison)",
  "heure_arrivee": "datetime (optional)",
  "statut": "string (optional)",
  "lignes": [
    {
      "id_article": "integer",
      "quantite": "integer",
      "prix_unitaire": "decimal",
      "commentaire_article": "string (optional)"
    }
  ]
}
```

**Response:** `201 Created`

#### Get Order
**GET** `/commandes/{id}`

Returns order details with items, payment, and delivery info.

**Response:** `200 OK`

#### Update Order
**PUT/PATCH** `/commandes/{id}`

Updates order status or time.

**Response:** `200 OK`

#### Cancel Order
**POST** `/commandes/{id}/cancel`

Cancels an order.

**Response:** `200 OK`

#### Delete Order
**DELETE** `/commandes/{id}`

Deletes an order.

**Response:** `200 OK`

### Reviews (Commentaires)

#### List My Reviews
**GET** `/commentaires`

**Response:** `200 OK` (Paginated)

#### Create Review
**POST** `/commentaires`

**Request Body:**
```json
{
  "id_commande": "integer",
  "contenu": "string",
  "note": "integer (1-5)",
  "est_visible": "boolean (optional)"
}
```

**Response:** `201 Created`

#### Get Review
**GET** `/commentaires/{id}`

**Response:** `200 OK`

#### Update Review
**PUT/PATCH** `/commentaires/{id}`

**Response:** `200 OK`

#### Delete Review
**DELETE** `/commentaires/{id}`

**Response:** `200 OK`

### Referrals (Parrainages)

Full CRUD operations available.

**Endpoints:**
- **GET** `/parrainages` - List referrals
- **POST** `/parrainages` - Create referral
- **GET** `/parrainages/{id}` - Get referral
- **PUT/PATCH** `/parrainages/{id}` - Update referral
- **DELETE** `/parrainages/{id}` - Delete referral

### Event Participations

Full CRUD operations available.

**Endpoints:**
- **GET** `/participations` - List participations
- **POST** `/participations` - Create participation
- **GET** `/participations/{id}` - Get participation
- **PUT/PATCH** `/participations/{id}` - Update participation
- **DELETE** `/participations/{id}` - Delete participation
- **POST** `/participations/{id}/mark-winner` - Mark as winner

### Complaints (Reclamations)

Full CRUD operations available.

**Endpoints:**
- **GET** `/reclamations` - List complaints
- **POST** `/reclamations` - Create complaint
- **GET** `/reclamations/{id}` - Get complaint
- **PUT/PATCH** `/reclamations/{id}` - Update complaint
- **DELETE** `/reclamations/{id}` - Delete complaint

### User Statistics

#### Get User Statistics
**GET** `/utilisateurs/{id}/statistics`

Returns user's order statistics and loyalty points.

**Response:** `200 OK`

#### Update Loyalty Points
**POST** `/utilisateurs/{id}/points`

Updates user's loyalty points.

**Request Body:**
```json
{
  "points": "integer",
  "action": "string (add|subtract|set)"
}
```

**Response:** `200 OK`

---

## Admin Routes

All admin routes require authentication and `administrateur` or `gerant` role.

Base path: `/admin`

### Dashboard & Statistics

#### Get Dashboard Statistics
**GET** `/admin/statistics`

Returns dashboard statistics.

**Response:** `200 OK`

#### Get Revenue Statistics
**GET** `/admin/revenue`

Returns revenue statistics.

**Response:** `200 OK`

### Employee Management

#### List Employees
**GET** `/admin/employees`

**Response:** `200 OK`

#### Create Employee (Admin Only)
**POST** `/admin/employees`

Requires `administrateur` role.

**Request Body:**
```json
{
  "id_utilisateur": "integer",
  "poste": "string",
  "date_embauche": "date",
  "salaire": "decimal",
  "est_actif": "boolean"
}
```

**Response:** `201 Created`

#### Get Employee
**GET** `/admin/employees/{id}`

**Response:** `200 OK`

#### Update Employee (Admin Only)
**PUT** `/admin/employees/{id}`

Requires `administrateur` role.

**Response:** `200 OK`

#### Delete Employee (Admin Only)
**DELETE** `/admin/employees/{id}`

Requires `administrateur` role.

**Response:** `200 OK`

#### Update Employee Status
**PATCH** `/admin/employees/{id}/status`

**Response:** `200 OK`

### Product/Article Management

#### Create Article
**POST** `/admin/articles`

**Response:** `201 Created`

#### Update Article
**PUT/PATCH** `/admin/articles/{id}`

**Response:** `200 OK`

#### Delete Article
**DELETE** `/admin/articles/{id}`

**Response:** `200 OK`

### Category Management

#### Create Category
**POST** `/admin/categories`

**Response:** `201 Created`

#### Update Category
**PUT/PATCH** `/admin/categories/{id}`

**Response:** `200 OK`

#### Delete Category
**DELETE** `/admin/categories/{id}`

**Response:** `200 OK`

### Order Management

#### List All Orders
**GET** `/admin/orders` or `/admin/commandes-all`

**Query Parameters:**
- `id_utilisateur` - Filter by user
- `statut` - Filter by status
- `type_service` - Filter by service type
- `date_from` - Filter from date
- `date_to` - Filter to date

**Response:** `200 OK` (Paginated)

#### Get Order Details
**GET** `/admin/orders/{id}`

**Response:** `200 OK`

#### Update Order Status
**PATCH** `/admin/orders/{id}/status` or `/admin/commandes/{id}`

**Response:** `200 OK`

### Delivery Management (Livraisons)

Full CRUD operations available.

**Endpoints:**
- **GET** `/admin/livraisons` - List deliveries
- **POST** `/admin/livraisons` - Create delivery
- **GET** `/admin/livraisons/{id}` - Get delivery
- **PUT/PATCH** `/admin/livraisons/{id}` - Update delivery
- **DELETE** `/admin/livraisons/{id}` - Delete delivery
- **PATCH** `/admin/livraisons/{id}/status` - Update status

### Payment Management (Paiements)

Full CRUD operations available.

**Endpoints:**
- **GET** `/admin/paiements` - List payments
- **POST** `/admin/paiements` - Create payment
- **GET** `/admin/paiements/{id}` - Get payment
- **PUT/PATCH** `/admin/paiements/{id}` - Update payment
- **DELETE** `/admin/paiements/{id}` - Delete payment
- **POST** `/admin/paiements/{id}/validate` - Validate payment

### Promotion Management

#### List Promotions
**GET** `/admin/promotions`

**Response:** `200 OK`

#### Create Promotion
**POST** `/admin/promotions`

**Request Body:**
```json
{
  "titre": "string",
  "description": "string (optional)",
  "reduction": "decimal (0-100, optional)",
  "montant_reduction": "decimal (optional)",
  "date_debut": "date",
  "date_fin": "date",
  "image_url": "string (optional)",
  "active": "boolean",
  "code_promo": "string (optional)",
  "nombre_utilisations": "integer (optional)",
  "limite_utilisations": "integer (optional)"
}
```

**Response:** `201 Created`

#### Update Promotion
**PUT** `/admin/promotions/{id}`

**Response:** `200 OK`

#### Delete Promotion
**DELETE** `/admin/promotions/{id}`

**Response:** `200 OK`

#### Toggle Promotion
**PATCH** `/admin/promotions/{id}/toggle`

**Response:** `200 OK`

### Event Management

#### List Events
**GET** `/admin/events`

**Response:** `200 OK`

#### Create Event
**POST** `/admin/events` or `/admin/evenements`

**Request Body:**
```json
{
  "titre": "string",
  "description": "string (optional)",
  "date_debut": "datetime",
  "date_fin": "datetime",
  "type_evenement": "string",
  "image_url": "string (optional)",
  "recompense_points": "integer (optional)",
  "nombre_participants_max": "integer (optional)",
  "est_actif": "boolean"
}
```

**Response:** `201 Created`

#### Update Event
**PUT** `/admin/events/{id}` or `/admin/evenements/{id}`

**Response:** `200 OK`

#### Delete Event
**DELETE** `/admin/events/{id}` or `/admin/evenements/{id}`

**Response:** `200 OK`

#### Get Event Participants
**GET** `/admin/events/{id}/participants`

**Response:** `200 OK`

### Complaint Management

#### List All Complaints
**GET** `/admin/complaints` or `/admin/reclamations-all`

**Query Parameters:**
- `id_utilisateur` - Filter by user
- `id_commande` - Filter by order
- `statut` - Filter by status
- `priorite` - Filter by priority

**Response:** `200 OK` (Paginated)

#### Get Complaint
**GET** `/admin/complaints/{id}`

**Response:** `200 OK`

#### Update Complaint Status
**PATCH** `/admin/complaints/{id}/status`

**Response:** `200 OK`

#### Respond to Complaint
**POST** `/admin/complaints/{id}/respond`

**Request Body:**
```json
{
  "reponse": "string"
}
```

**Response:** `200 OK`

#### Assign Complaint
**POST** `/admin/reclamations/{id}/assign`

**Request Body:**
```json
{
  "id_employe_traitement": "integer"
}
```

**Response:** `200 OK`

#### Resolve Complaint
**POST** `/admin/reclamations/{id}/resolve`

**Request Body:**
```json
{
  "reponse": "string"
}
```

**Response:** `200 OK`

### Review Management

#### List All Reviews
**GET** `/admin/commentaires-all`

**Response:** `200 OK` (Paginated)

#### Toggle Review Visibility
**POST** `/admin/commentaires/{id}/toggle-visibility`

**Response:** `200 OK`

### Referral Management

#### List All Referrals
**GET** `/admin/parrainages-all`

**Response:** `200 OK` (Paginated)

#### Attribute Reward
**POST** `/admin/parrainages/{id}/attribute-reward`

**Request Body:**
```json
{
  "points_gagnes": "integer"
}
```

**Response:** `200 OK`

### User Management

Full CRUD operations available.

**Endpoints:**
- **GET** `/admin/utilisateurs` - List users
- **POST** `/admin/utilisateurs` - Create user
- **GET** `/admin/utilisateurs/{id}` - Get user
- **PUT/PATCH** `/admin/utilisateurs/{id}` - Update user
- **DELETE** `/admin/utilisateurs/{id}` - Delete user
- **POST** `/admin/utilisateurs/{id}/suspend` - Suspend user
- **POST** `/admin/utilisateurs/{id}/activate` - Activate user

### Role Management

Full CRUD operations available.

**Endpoints:**
- **GET** `/admin/roles` - List roles
- **POST** `/admin/roles` - Create role
- **GET** `/admin/roles/{id}` - Get role
- **PUT/PATCH** `/admin/roles/{id}` - Update role
- **DELETE** `/admin/roles/{id}` - Delete role

### Statistics Management

**Endpoints:**
- **GET** `/admin/statistiques` - List statistics
- **POST** `/admin/statistiques` - Create statistic
- **GET** `/admin/statistiques/{id}` - Get statistic
- **PUT/PATCH** `/admin/statistiques/{id}` - Update statistic
- **DELETE** `/admin/statistiques/{id}` - Delete statistic
- **GET** `/admin/statistiques/user/{idUtilisateur}` - Get by user
- **POST** `/admin/statistiques/user/{idUtilisateur}/increment-order` - Increment order
- **POST** `/admin/statistiques/user/{idUtilisateur}/update-rating` - Update rating

### Settings (Admin Only)

Requires `administrateur` role.

#### Get Settings
**GET** `/admin/settings`

**Response:** `200 OK`

#### Update Settings
**PUT** `/admin/settings`

**Response:** `200 OK`

#### Get Opening Hours
**GET** `/admin/settings/horaires`

**Response:** `200 OK`

#### Update Opening Hours
**PUT** `/admin/settings/horaires`

**Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "Non authentifié"
}
```

### 403 Forbidden
```json
{
  "message": "Accès non autorisé. Rôle requis: ..."
}
```

### 404 Not Found
```json
{
  "message": "Resource non trouvée"
}
```

### 422 Validation Error
```json
{
  "message": "Validation error",
  "errors": {
    "field": ["error message"]
  }
}
```

### 500 Server Error
```json
{
  "message": "Erreur serveur",
  "error": "error details"
}
```

---

## Notes

1. All authenticated requests require the `Authorization: Bearer {token}` header
2. All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
3. Pagination responses include `data`, `current_page`, `last_page`, `per_page`, `total` fields
4. `apiResource` routes include standard REST operations: index, store, show, update, destroy
