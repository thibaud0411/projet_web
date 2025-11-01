# Guide de démarrage Supabase - Mon Miam Miam

## Étape 1 : Création du projet (5 minutes)

1. **Créez un compte** sur [supabase.com](https://supabase.com)
2. **Créez un nouveau projet** :
   - Nom : `mon-miam-miam`
   - Database Password : Notez-le bien !
   - Région : `Central EU` (le plus proche)

3. **Partagez avec l'équipe** :
   - Allez dans Settings → API
   - Partagez l'URL du projet et les clés API
   - Ajoutez les membres dans Settings → Team

## Étape 2 : Structure de la base de données

### Option A : Via l'interface SQL Editor

1. Allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Collez le script SQL complet (CREATE_DB.sql)
4. Exécutez

### Option B : Via le Table Editor (recommandé pour débuter)

Créez les tables principales dans cet ordre :

**1. Table users**
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    role VARCHAR(20) DEFAULT 'etudiant',
    points_fidelite INT DEFAULT 0,
    code_parrainage VARCHAR(20) UNIQUE,
    id_parrain UUID REFERENCES users(id),
    localisation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**2. Table categories**
```sql
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INT DEFAULT 0,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**3. Table produits**
```sql
CREATE TABLE produits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_categorie UUID REFERENCES categories(id),
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    est_disponible BOOLEAN DEFAULT TRUE,
    est_plat_du_jour BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**4. Table commandes**
```sql
CREATE TABLE commandes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_utilisateur UUID REFERENCES users(id),
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    type_service VARCHAR(20) NOT NULL,
    montant_total DECIMAL(10,2) NOT NULL,
    points_utilises INT DEFAULT 0,
    points_accumules INT DEFAULT 0,
    statut VARCHAR(30) DEFAULT 'en_attente',
    mode_paiement VARCHAR(30),
    statut_paiement VARCHAR(30) DEFAULT 'en_attente',
    date_commande TIMESTAMP DEFAULT NOW()
);
```

## Étape 3 : Configuration de la sécurité (Row Level Security)

Supabase utilise PostgreSQL et RLS pour la sécurité. Exemples de politiques :

```sql
-- Permettre aux utilisateurs de voir leurs propres commandes
CREATE POLICY "Users can view own orders"
ON commandes FOR SELECT
USING (auth.uid() = id_utilisateur);

-- Permettre aux utilisateurs de créer des commandes
CREATE POLICY "Users can create orders"
ON commandes FOR INSERT
WITH CHECK (auth.uid() = id_utilisateur);

-- Les employés peuvent voir toutes les commandes
CREATE POLICY "Employees can view all orders"
ON commandes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('employe', 'gerant', 'administrateur')
    )
);
```

## Étape 4 : Configuration Frontend

### Installation des dépendances

```bash
npm install @supabase/supabase-js
```

### Configuration (créez `src/lib/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'VOTRE_URL_SUPABASE'
const supabaseAnonKey = 'VOTRE_CLE_PUBLIQUE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Exemples d'utilisation

**Authentification :**
```javascript
// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'Password123',
  options: {
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+237600000000'
    }
  }
})

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'Password123'
})
```

**CRUD sur les produits :**
```javascript
// Récupérer tous les produits disponibles
const { data: produits, error } = await supabase
  .from('produits')
  .select(`
    *,
    categories (nom)
  `)
  .eq('est_disponible', true)

// Créer une commande
const { data, error } = await supabase
  .from('commandes')
  .insert({
    id_utilisateur: user.id,
    numero_commande: `CMD-${Date.now()}`,
    type_service: 'livraison',
    montant_total: 5000
  })

// Mise à jour en temps réel
const channel = supabase
  .channel('commandes-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'commandes' },
    (payload) => {
      console.log('Nouvelle commande !', payload)
    }
  )
  .subscribe()
```

## Étape 5 : Storage pour les images

```javascript
// Upload d'une image de produit
const { data, error } = await supabase.storage
  .from('produits-images')
  .upload(`${produitId}.jpg`, file)

// Récupérer l'URL publique
const { data } = supabase.storage
  .from('produits-images')
  .getPublicUrl(`${produitId}.jpg`)
```

## Étape 6 : Statistiques et agrégations

```javascript
// Top 10 meilleurs clients
const { data, error } = await supabase.rpc('get_top_clients', {
  periode: 'mois' // ou 'semaine', 'jour'
})
```

**Créez la fonction SQL :**
```sql
CREATE OR REPLACE FUNCTION get_top_clients(periode TEXT)
RETURNS TABLE (
    id_utilisateur UUID,
    nom VARCHAR,
    prenom VARCHAR,
    total_commandes BIGINT,
    montant_total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nom,
        u.prenom,
        COUNT(c.id) as total_commandes,
        SUM(c.montant_total) as montant_total
    FROM users u
    JOIN commandes c ON u.id = c.id_utilisateur
    WHERE 
        CASE 
            WHEN periode = 'jour' THEN c.date_commande >= NOW() - INTERVAL '1 day'
            WHEN periode = 'semaine' THEN c.date_commande >= NOW() - INTERVAL '1 week'
            WHEN periode = 'mois' THEN c.date_commande >= NOW() - INTERVAL '1 month'
        END
    GROUP BY u.id, u.nom, u.prenom
    ORDER BY total_commandes DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

## Avantages pour votre équipe de 6 personnes

✅ **Tout le monde travaille sur la même base**
✅ **Pas de "ça marche sur ma machine"**
✅ **Tests collaboratifs possibles immédiatement**
✅ **API prête, concentrez-vous sur le frontend**
✅ **Temps réel natif pour les statistiques**
✅ **Authentication déjà codée**
✅ **Storage pour les images inclus**

## Ressources

- Documentation : https://supabase.com/docs
- Dashboard : https://app.supabase.com
- Communauté : https://discord.supabase.com
- Tutoriels : https://supabase.com/docs/guides

## Notes importantes

- Plan gratuit : 500 MB base de données, 1 GB storage (largement suffisant)
- Pas besoin de carte bancaire
- Vous pouvez toujours exporter vos données si besoin
- Compatible avec tous les frameworks (React, Vue, Angular, etc.)