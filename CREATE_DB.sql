-- =============================================
-- BASE DE DONNÉES SUPABASE - MON MIAM MIAM
-- Compatible PostgreSQL avec UUID
-- Date: 2024-10-08
-- =============================================

-- Active l'extension UUID si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES UTILISATEURS ET AUTHENTIFICATION
-- =============================================

-- Table des utilisateurs (intégration avec Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('etudiant', 'employe', 'gerant', 'administrateur')) DEFAULT 'etudiant',
    statut_compte VARCHAR(20) CHECK (statut_compte IN ('actif', 'inactif', 'suspendu')) DEFAULT 'actif',
    points_fidelite INT DEFAULT 0,
    code_parrainage VARCHAR(20) UNIQUE,
    id_parrain UUID REFERENCES users(id) ON DELETE SET NULL,
    localisation TEXT,
    consentement_cookies BOOLEAN DEFAULT FALSE,
    date_consentement_cookies TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_code_parrainage ON users(code_parrainage);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_id_parrain ON users(id_parrain);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLES MENU ET PRODUITS
-- =============================================

-- Table des catégories de produits
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INT DEFAULT 0,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des produits/plats
CREATE TABLE produits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_categorie UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
    image_url TEXT,
    est_disponible BOOLEAN DEFAULT TRUE,
    est_plat_du_jour BOOLEAN DEFAULT FALSE,
    temps_preparation INT CHECK (temps_preparation > 0),
    allergenes TEXT,
    calories INT CHECK (calories >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_produits_categorie ON produits(id_categorie);
CREATE INDEX idx_produits_disponible ON produits(est_disponible);
CREATE INDEX idx_produits_plat_jour ON produits(est_plat_du_jour);

CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLES COMMANDES
-- =============================================

-- Table des commandes
CREATE TABLE commandes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_utilisateur UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    type_service VARCHAR(20) CHECK (type_service IN ('sur_place', 'livraison')) NOT NULL,
    heure_arrivee_souhaitee TIME,
    adresse_livraison TEXT,
    montant_total DECIMAL(10,2) NOT NULL CHECK (montant_total >= 0),
    montant_reduction DECIMAL(10,2) DEFAULT 0 CHECK (montant_reduction >= 0),
    points_utilises INT DEFAULT 0 CHECK (points_utilises >= 0),
    points_accumules INT DEFAULT 0 CHECK (points_accumules >= 0),
    statut VARCHAR(30) CHECK (statut IN ('en_attente', 'confirmee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee')) DEFAULT 'en_attente',
    mode_paiement VARCHAR(30) CHECK (mode_paiement IN ('especes', 'mobile_money', 'carte_bancaire', 'points_fidelite')),
    statut_paiement VARCHAR(30) CHECK (statut_paiement IN ('en_attente', 'paye', 'echoue', 'rembourse')) DEFAULT 'en_attente',
    transaction_id VARCHAR(255),
    commentaire_client TEXT,
    notes_preparation TEXT,
    id_employe_validateur UUID REFERENCES users(id) ON DELETE SET NULL,
    date_commande TIMESTAMPTZ DEFAULT NOW(),
    date_validation TIMESTAMPTZ,
    date_livraison TIMESTAMPTZ
);

CREATE INDEX idx_commandes_numero ON commandes(numero_commande);
CREATE INDEX idx_commandes_utilisateur ON commandes(id_utilisateur);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_date ON commandes(date_commande DESC);

-- Table des détails de commande
CREATE TABLE details_commande (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_commande UUID REFERENCES commandes(id) ON DELETE CASCADE NOT NULL,
    id_produit UUID REFERENCES produits(id) ON DELETE CASCADE NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire >= 0),
    sous_total DECIMAL(10,2) NOT NULL CHECK (sous_total >= 0),
    notes_speciales TEXT
);

CREATE INDEX idx_details_commande ON details_commande(id_commande);
CREATE INDEX idx_details_produit ON details_commande(id_produit);

-- =============================================
-- TABLES FIDÉLITÉ ET PARRAINAGE
-- =============================================

-- Table d'historique des points de fidélité
CREATE TABLE historique_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_utilisateur UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    id_commande UUID REFERENCES commandes(id) ON DELETE SET NULL,
    type_operation VARCHAR(20) CHECK (type_operation IN ('gain', 'utilisation', 'expiration', 'ajustement', 'parrainage')) NOT NULL,
    points INT NOT NULL,
    solde_apres_operation INT NOT NULL,
    description VARCHAR(255),
    date_operation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historique_utilisateur ON historique_points(id_utilisateur);
CREATE INDEX idx_historique_date ON historique_points(date_operation DESC);

-- Table des parrainages
CREATE TABLE parrainages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_parrain UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    id_filleul UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    points_attribues INT DEFAULT 0,
    recompense_obtenue BOOLEAN DEFAULT FALSE,
    date_parrainage TIMESTAMPTZ DEFAULT NOW(),
    date_premiere_commande TIMESTAMPTZ,
    UNIQUE(id_parrain, id_filleul)
);

CREATE INDEX idx_parrainages_parrain ON parrainages(id_parrain);
CREATE INDEX idx_parrainages_filleul ON parrainages(id_filleul);

-- =============================================
-- TABLES RÉCLAMATIONS
-- =============================================

-- Table des réclamations
CREATE TABLE reclamations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_utilisateur UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    id_commande UUID REFERENCES commandes(id) ON DELETE SET NULL,
    sujet VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    statut VARCHAR(20) CHECK (statut IN ('en_attente', 'en_cours', 'resolue', 'rejetee')) DEFAULT 'en_attente',
    priorite VARCHAR(20) CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')) DEFAULT 'normale',
    id_employe_traitement UUID REFERENCES users(id) ON DELETE SET NULL,
    reponse TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    date_traitement TIMESTAMPTZ,
    date_resolution TIMESTAMPTZ
);

CREATE INDEX idx_reclamations_utilisateur ON reclamations(id_utilisateur);
CREATE INDEX idx_reclamations_statut ON reclamations(statut);
CREATE INDEX idx_reclamations_date ON reclamations(date_creation DESC);

-- =============================================
-- TABLES PROMOTIONS ET ÉVÉNEMENTS
-- =============================================

-- Table des promotions
CREATE TABLE promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    description TEXT,
    type_promotion VARCHAR(30) CHECK (type_promotion IN ('pourcentage', 'montant_fixe', 'produit_gratuit', 'points_bonus')) NOT NULL,
    valeur DECIMAL(10,2) NOT NULL CHECK (valeur >= 0),
    code_promo VARCHAR(50) UNIQUE,
    image_affiche TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    est_active BOOLEAN DEFAULT TRUE,
    conditions TEXT,
    nombre_utilisations INT DEFAULT 0,
    limite_utilisations INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (date_fin >= date_debut)
);

CREATE INDEX idx_promotions_dates ON promotions(date_debut, date_fin);
CREATE INDEX idx_promotions_code ON promotions(code_promo);
CREATE INDEX idx_promotions_active ON promotions(est_active);

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des événements
CREATE TABLE evenements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    description TEXT,
    type_evenement VARCHAR(30) CHECK (type_evenement IN ('jeu', 'concours', 'soiree_thematique', 'match', 'autre')) NOT NULL,
    image_affiche TEXT,
    date_debut TIMESTAMPTZ NOT NULL,
    date_fin TIMESTAMPTZ NOT NULL,
    lieu VARCHAR(200) DEFAULT 'ZeDuc@Space',
    recompenses TEXT,
    nombre_participants INT DEFAULT 0,
    limite_participants INT,
    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (date_fin >= date_debut)
);

CREATE INDEX idx_evenements_dates ON evenements(date_debut, date_fin);
CREATE INDEX idx_evenements_actif ON evenements(est_actif);

-- Table de participation aux événements
CREATE TABLE participations_evenements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_evenement UUID REFERENCES evenements(id) ON DELETE CASCADE NOT NULL,
    id_utilisateur UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    score INT,
    a_gagne BOOLEAN DEFAULT FALSE,
    recompense_obtenue TEXT,
    date_participation TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_evenement, id_utilisateur)
);

CREATE INDEX idx_participations_evenement ON participations_evenements(id_evenement);
CREATE INDEX idx_participations_utilisateur ON participations_evenements(id_utilisateur);

-- =============================================
-- TABLES PARAMÈTRES ET CONFIGURATION
-- =============================================

-- Table des paramètres de l'application
CREATE TABLE parametres (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    type_valeur VARCHAR(20) CHECK (type_valeur IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_parametres_updated_at BEFORE UPDATE ON parametres
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des horaires d'ouverture
CREATE TABLE horaires (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    jour_semaine VARCHAR(20) CHECK (jour_semaine IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')) NOT NULL UNIQUE,
    heure_ouverture TIME NOT NULL,
    heure_fermeture TIME NOT NULL,
    est_ferme BOOLEAN DEFAULT FALSE
);

-- =============================================
-- TABLES AUDIT ET LOGS
-- =============================================

-- Table de logs des activités
CREATE TABLE logs_activites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_utilisateur UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_affectee VARCHAR(50),
    id_enregistrement UUID,
    details JSONB,
    adresse_ip INET,
    user_agent TEXT,
    date_action TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_utilisateur ON logs_activites(id_utilisateur);
CREATE INDEX idx_logs_date ON logs_activites(date_action DESC);
CREATE INDEX idx_logs_action ON logs_activites(action);

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        code := 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE code_parrainage = code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de commande
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Fonction pour calculer les points de fidélité
CREATE OR REPLACE FUNCTION calculate_loyalty_points(montant DECIMAL)
RETURNS INT AS $$
DECLARE
    taux_conversion INT;
BEGIN
    SELECT CAST(valeur AS INT) INTO taux_conversion 
    FROM parametres 
    WHERE cle = 'taux_conversion_points';
    
    RETURN FLOOR(montant / taux_conversion);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les top clients
CREATE OR REPLACE FUNCTION get_top_clients(
    periode TEXT DEFAULT 'mois',
    limite INT DEFAULT 10
)
RETURNS TABLE (
    id_utilisateur UUID,
    nom VARCHAR,
    prenom VARCHAR,
    email VARCHAR,
    total_commandes BIGINT,
    montant_total DECIMAL,
    points_fidelite INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nom,
        u.prenom,
        u.email,
        COUNT(c.id) as total_commandes,
        COALESCE(SUM(c.montant_total), 0) as montant_total,
        u.points_fidelite
    FROM users u
    LEFT JOIN commandes c ON u.id = c.id_utilisateur 
        AND c.statut = 'livree'
        AND CASE 
            WHEN periode = 'jour' THEN c.date_commande >= NOW() - INTERVAL '1 day'
            WHEN periode = 'semaine' THEN c.date_commande >= NOW() - INTERVAL '1 week'
            WHEN periode = 'mois' THEN c.date_commande >= NOW() - INTERVAL '1 month'
            ELSE TRUE
        END
    WHERE u.role = 'etudiant'
    GROUP BY u.id, u.nom, u.prenom, u.email, u.points_fidelite
    ORDER BY total_commandes DESC, montant_total DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques de vente
CREATE OR REPLACE FUNCTION get_sales_statistics(
    date_debut TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    date_fin TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_commandes BIGINT,
    montant_total DECIMAL,
    montant_moyen DECIMAL,
    commandes_livrees BIGINT,
    commandes_annulees BIGINT,
    produit_plus_vendu TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(c.id)::BIGINT as total_commandes,
        COALESCE(SUM(c.montant_total), 0) as montant_total,
        COALESCE(AVG(c.montant_total), 0) as montant_moyen,
        COUNT(CASE WHEN c.statut = 'livree' THEN 1 END)::BIGINT as commandes_livrees,
        COUNT(CASE WHEN c.statut = 'annulee' THEN 1 END)::BIGINT as commandes_annulees,
        (
            SELECT p.nom 
            FROM details_commande dc
            JOIN produits p ON dc.id_produit = p.id
            JOIN commandes cmd ON dc.id_commande = cmd.id
            WHERE cmd.date_commande BETWEEN date_debut AND date_fin
            GROUP BY p.id, p.nom
            ORDER BY SUM(dc.quantite) DESC
            LIMIT 1
        ) as produit_plus_vendu
    FROM commandes c
    WHERE c.date_commande BETWEEN date_debut AND date_fin;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS MÉTIER
-- =============================================

-- Trigger pour calculer automatiquement les points lors d'une commande
CREATE OR REPLACE FUNCTION calculate_order_points()
RETURNS TRIGGER AS $$
DECLARE
    points_gagnes INT;
BEGIN
    IF NEW.statut = 'livree' AND (OLD.statut IS NULL OR OLD.statut != 'livree') THEN
        points_gagnes := calculate_loyalty_points(NEW.montant_total);
        
        -- Mettre à jour les points de l'utilisateur
        UPDATE users 
        SET points_fidelite = points_fidelite + points_gagnes
        WHERE id = NEW.id_utilisateur;
        
        -- Enregistrer dans l'historique
        INSERT INTO historique_points (
            id_utilisateur, 
            id_commande, 
            type_operation, 
            points, 
            solde_apres_operation,
            description
        )
        SELECT 
            NEW.id_utilisateur,
            NEW.id,
            'gain',
            points_gagnes,
            points_fidelite + points_gagnes,
            'Points gagnés pour la commande ' || NEW.numero_commande
        FROM users WHERE id = NEW.id_utilisateur;
        
        -- Mettre à jour les points accumulés dans la commande
        NEW.points_accumules := points_gagnes;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_order_points
    BEFORE UPDATE ON commandes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_points();

-- Trigger pour gérer les récompenses de parrainage
CREATE OR REPLACE FUNCTION handle_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
    points_parrainage INT;
BEGIN
    IF NEW.statut = 'livree' AND (OLD.statut IS NULL OR OLD.statut != 'livree') THEN
        -- Vérifier si c'est la première commande du filleul
        IF NOT EXISTS (
            SELECT 1 FROM commandes 
            WHERE id_utilisateur = NEW.id_utilisateur 
            AND id != NEW.id 
            AND statut = 'livree'
        ) THEN
            -- Si l'utilisateur a un parrain
            IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id_utilisateur AND id_parrain IS NOT NULL) THEN
                -- Récupérer les points de parrainage
                SELECT CAST(valeur AS INT) INTO points_parrainage 
                FROM parametres 
                WHERE cle = 'points_parrainage';
                
                -- Attribuer les points au parrain
                UPDATE users 
                SET points_fidelite = points_fidelite + points_parrainage
                WHERE id = (SELECT id_parrain FROM users WHERE id = NEW.id_utilisateur);
                
                -- Mettre à jour le parrainage
                UPDATE parrainages
                SET 
                    recompense_obtenue = TRUE,
                    points_attribues = points_parrainage,
                    date_premiere_commande = NOW()
                WHERE id_filleul = NEW.id_utilisateur;
                
                -- Enregistrer dans l'historique du parrain
                INSERT INTO historique_points (
                    id_utilisateur,
                    type_operation,
                    points,
                    solde_apres_operation,
                    description
                )
                SELECT 
                    u.id_parrain,
                    'parrainage',
                    points_parrainage,
                    (SELECT points_fidelite FROM users WHERE id = u.id_parrain),
                    'Parrainage de ' || u.prenom || ' ' || u.nom
                FROM users u
                WHERE u.id = NEW.id_utilisateur;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_referral_reward
    AFTER UPDATE ON commandes
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_reward();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE details_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE parrainages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reclamations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations_evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;
ALTER TABLE horaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_activites ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les admins et gérants peuvent voir tous les utilisateurs"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

-- Politiques pour les produits (lecture publique)
CREATE POLICY "Tout le monde peut voir les produits"
    ON produits FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Seuls les employés peuvent modifier les produits"
    ON produits FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

-- Politiques pour les catégories
CREATE POLICY "Tout le monde peut voir les catégories"
    ON categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les catégories"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant')
        )
    );

-- Politiques pour les commandes
CREATE POLICY "Les utilisateurs peuvent voir leurs propres commandes"
    ON commandes FOR SELECT
    USING (auth.uid() = id_utilisateur);

CREATE POLICY "Les utilisateurs peuvent créer des commandes"
    ON commandes FOR INSERT
    WITH CHECK (auth.uid() = id_utilisateur);

CREATE POLICY "Les employés peuvent voir toutes les commandes"
    ON commandes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

CREATE POLICY "Les employés peuvent mettre à jour les commandes"
    ON commandes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

-- Politiques pour les détails de commande
CREATE POLICY "Les utilisateurs peuvent voir les détails de leurs commandes"
    ON details_commande FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM commandes 
            WHERE commandes.id = details_commande.id_commande 
            AND commandes.id_utilisateur = auth.uid()
        )
    );

CREATE POLICY "Les employés peuvent voir tous les détails"
    ON details_commande FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

-- Politiques pour l'historique des points
CREATE POLICY "Les utilisateurs peuvent voir leur historique de points"
    ON historique_points FOR SELECT
    USING (auth.uid() = id_utilisateur);

CREATE POLICY "Les admins peuvent voir tout l'historique"
    ON historique_points FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant')
        )
    );

-- Politiques pour les réclamations
CREATE POLICY "Les utilisateurs peuvent voir leurs réclamations"
    ON reclamations FOR SELECT
    USING (auth.uid() = id_utilisateur);

CREATE POLICY "Les utilisateurs peuvent créer des réclamations"
    ON reclamations FOR INSERT
    WITH CHECK (auth.uid() = id_utilisateur);

CREATE POLICY "Les employés peuvent voir toutes les réclamations"
    ON reclamations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant', 'employe')
        )
    );

-- Politiques pour les promotions et événements (lecture publique)
CREATE POLICY "Tout le monde peut voir les promotions actives"
    ON promotions FOR SELECT
    TO authenticated
    USING (est_active = true OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('administrateur', 'gerant')
    ));

CREATE POLICY "Seuls les admins peuvent gérer les promotions"
    ON promotions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('administrateur', 'gerant')
        )
    );

CREATE POLICY "Tout le monde peut voir les événements actifs"
    ON evenements FOR SELECT
    TO authenticated
    USING (est_actif = true OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('administrateur', 'gerant')
    ));

-- Politiques pour les paramètres
CREATE POLICY "Tout le monde peut lire les paramètres"
    ON parametres FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les paramètres"
    ON parametres FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'administrateur'
        )
    );

-- Politiques pour les horaires (lecture publique)
CREATE POLICY "Tout le monde peut voir les horaires"
    ON horaires FOR SELECT
    TO authenticated
    USING (true);

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Paramètres par défaut
INSERT INTO parametres (cle, valeur, type_valeur, description) VALUES
('taux_conversion_points', '1000', 'number', 'Montant en FCFA pour obtenir 1 point'),
('points_pour_reduction', '15', 'number', 'Nombre de points nécessaires pour une réduction'),
('valeur_reduction', '1000', 'number', 'Valeur de la réduction en FCFA'),
('points_parrainage', '50', 'number', 'Points attribués au parrain'),
('duree_validite_points', '12', 'number', 'Durée de validité des points en mois'),
('frais_livraison', '500', 'number', 'Frais de livraison en FCFA'),
('montant_min_livraison', '2000', 'number', 'Montant minimum pour la livraison'),
('nom_restaurant', 'ZeDuc@Space - Mon Miam Miam', 'string', 'Nom du restaurant'),
('primary_color', '#cfbd97', 'string', 'Couleur principale'),
('secondary_color', '#000000', 'string', 'Couleur secondaire');

-- Horaires par défaut
INSERT INTO horaires (jour_semaine, heure_ouverture, heure_fermeture, est_ferme) VALUES
('lundi', '08:00:00', '22:00:00', FALSE),
('mardi', '08:00:00', '22:00:00', FALSE),
('mercredi', '08:00:00', '22:00:00', FALSE),
('jeudi', '08:00:00', '22:00:00', FALSE),
('vendredi', '08:00:00', '23:00:00', FALSE),
('samedi', '09:00:00', '23:00:00', FALSE),
('dimanche', '10:00:00', '22:00:00', FALSE);

-- Catégories par défaut
INSERT INTO categories (nom, description, ordre_affichage) VALUES
('Plats principaux', 'Nos délicieux plats principaux', 1),
('Accompagnements', 'Pour accompagner vos plats', 2),
('Boissons', 'Boissons chaudes et froides', 3),
('Desserts', 'Pour terminer en beauté', 4),
('Snacks', 'Petites faims et en-cas', 5);

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue pour les commandes avec informations utilisateur
CREATE OR REPLACE VIEW vue_commandes_detaillees AS
SELECT 
    c.id,
    c.numero_commande,
    c.type_service,
    c.montant_total,
    c.statut,
    c.statut_paiement,
    c.date_commande,
    u.nom as client_nom,
    u.prenom as client_prenom,
    u.email as client_email,
    u.telephone as client_telephone,
    emp.nom as employe_nom,
    emp.prenom as employe_prenom,
    (
        SELECT COUNT(*) 
        FROM details_commande dc 
        WHERE dc.id_commande = c.id
    ) as nombre_articles,
    (
        SELECT SUM(dc.quantite) 
        FROM details_commande dc 
        WHERE dc.id_commande = c.id
    ) as quantite_totale
FROM commandes c
JOIN users u ON c.id_utilisateur = u.id
LEFT JOIN users emp ON c.id_employe_validateur = emp.id;

-- Vue pour les produits avec catégorie
CREATE OR REPLACE VIEW vue_produits_avec_categorie AS
SELECT 
    p.id,
    p.nom,
    p.description,
    p.prix,
    p.image_url,
    p.est_disponible,
    p.est_plat_du_jour,
    p.temps_preparation,
    c.nom as categorie_nom,
    c.id as categorie_id
FROM produits p
JOIN categories c ON p.id_categorie = c.id;

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW vue_statistiques_utilisateurs AS
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.points_fidelite,
    u.code_parrainage,
    COUNT(DISTINCT c.id) as nombre_commandes,
    COALESCE(SUM(c.montant_total), 0) as montant_total_depense,
    COALESCE(AVG(c.montant_total), 0) as panier_moyen,
    (SELECT COUNT(*) FROM parrainages WHERE id_parrain = u.id) as nombre_filleuls,
    (SELECT COUNT(*) FROM reclamations WHERE id_utilisateur = u.id) as nombre_reclamations
FROM users u
LEFT JOIN commandes c ON u.id = c.id_utilisateur AND c.statut = 'livree'
WHERE u.role = 'etudiant'
GROUP BY u.id, u.nom, u.prenom, u.email, u.points_fidelite, u.code_parrainage;

-- =============================================
-- FONCTIONS SUPPLÉMENTAIRES
-- =============================================

-- Fonction pour vérifier la disponibilité d'un produit
CREATE OR REPLACE FUNCTION check_product_availability(product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT est_disponible INTO is_available
    FROM produits
    WHERE id = product_id;
    
    RETURN COALESCE(is_available, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le total d'une commande
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(sous_total), 0) INTO total
    FROM details_commande
    WHERE id_commande = order_id;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour appliquer une réduction de points
CREATE OR REPLACE FUNCTION apply_points_discount(
    user_id UUID,
    points_to_use INT
)
RETURNS TABLE (
    success BOOLEAN,
    discount_amount DECIMAL,
    message TEXT
) AS $$
DECLARE
    user_points INT;
    points_requis INT;
    valeur_red DECIMAL;
    discount DECIMAL;
BEGIN
    -- Récupérer les points de l'utilisateur
    SELECT points_fidelite INTO user_points
    FROM users
    WHERE id = user_id;
    
    -- Récupérer les paramètres
    SELECT CAST(valeur AS INT) INTO points_requis
    FROM parametres
    WHERE cle = 'points_pour_reduction';
    
    SELECT CAST(valeur AS DECIMAL) INTO valeur_red
    FROM parametres
    WHERE cle = 'valeur_reduction';
    
    -- Vérifier si l'utilisateur a assez de points
    IF user_points < points_to_use THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Points insuffisants'::TEXT;
        RETURN;
    END IF;
    
    -- Calculer la réduction
    discount := (points_to_use / points_requis) * valeur_red;
    
    RETURN QUERY SELECT TRUE, discount, 'Réduction appliquée avec succès'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les produits recommandés
CREATE OR REPLACE FUNCTION get_recommended_products(user_id UUID, limit_count INT DEFAULT 5)
RETURNS TABLE (
    id UUID,
    nom VARCHAR,
    description TEXT,
    prix DECIMAL,
    image_url TEXT,
    popularite BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nom,
        p.description,
        p.prix,
        p.image_url,
        COUNT(dc.id) as popularite
    FROM produits p
    LEFT JOIN details_commande dc ON p.id = dc.id_produit
    LEFT JOIN commandes c ON dc.id_commande = c.id
    WHERE p.est_disponible = TRUE
    AND (c.date_commande IS NULL OR c.date_commande >= NOW() - INTERVAL '30 days')
    GROUP BY p.id, p.nom, p.description, p.prix, p.image_url
    ORDER BY popularite DESC, p.nom
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le CA par période
CREATE OR REPLACE FUNCTION get_revenue_by_period(
    period_type TEXT DEFAULT 'day',
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    periode TEXT,
    nombre_commandes BIGINT,
    chiffre_affaires DECIMAL
) AS $$
BEGIN
    IF period_type = 'day' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(date_commande, 'YYYY-MM-DD') as periode,
            COUNT(id)::BIGINT as nombre_commandes,
            COALESCE(SUM(montant_total), 0) as chiffre_affaires
        FROM commandes
        WHERE date_commande BETWEEN start_date AND end_date
        AND statut = 'livree'
        GROUP BY TO_CHAR(date_commande, 'YYYY-MM-DD')
        ORDER BY periode;
    ELSIF period_type = 'week' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(date_commande, 'IYYY-IW') as periode,
            COUNT(id)::BIGINT as nombre_commandes,
            COALESCE(SUM(montant_total), 0) as chiffre_affaires
        FROM commandes
        WHERE date_commande BETWEEN start_date AND end_date
        AND statut = 'livree'
        GROUP BY TO_CHAR(date_commande, 'IYYY-IW')
        ORDER BY periode;
    ELSIF period_type = 'month' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(date_commande, 'YYYY-MM') as periode,
            COUNT(id)::BIGINT as nombre_commandes,
            COALESCE(SUM(montant_total), 0) as chiffre_affaires
        FROM commandes
        WHERE date_commande BETWEEN start_date AND end_date
        AND statut = 'livree'
        GROUP BY TO_CHAR(date_commande, 'YYYY-MM')
        ORDER BY periode;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les produits les plus vendus
CREATE OR REPLACE FUNCTION get_top_selling_products(
    limit_count INT DEFAULT 10,
    period_days INT DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    nom VARCHAR,
    categorie VARCHAR,
    quantite_vendue BIGINT,
    chiffre_affaires DECIMAL,
    nombre_commandes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nom,
        c.nom as categorie,
        SUM(dc.quantite)::BIGINT as quantite_vendue,
        SUM(dc.sous_total) as chiffre_affaires,
        COUNT(DISTINCT dc.id_commande)::BIGINT as nombre_commandes
    FROM produits p
    JOIN categories c ON p.id_categorie = c.id
    JOIN details_commande dc ON p.id = dc.id_produit
    JOIN commandes cmd ON dc.id_commande = cmd.id
    WHERE cmd.statut = 'livree'
    AND cmd.date_commande >= NOW() - (period_days || ' days')::INTERVAL
    GROUP BY p.id, p.nom, c.nom
    ORDER BY quantite_vendue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider un code promo
CREATE OR REPLACE FUNCTION validate_promo_code(code VARCHAR)
RETURNS TABLE (
    valid BOOLEAN,
    promo_id UUID,
    type_promotion VARCHAR,
    valeur DECIMAL,
    message TEXT
) AS $$
DECLARE
    promo_record RECORD;
BEGIN
    SELECT * INTO promo_record
    FROM promotions
    WHERE code_promo = code
    AND est_active = TRUE
    AND CURRENT_DATE BETWEEN date_debut AND date_fin
    AND (limite_utilisations IS NULL OR nombre_utilisations < limite_utilisations);
    
    IF promo_record IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::DECIMAL, 'Code promo invalide ou expiré'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            TRUE, 
            promo_record.id, 
            promo_record.type_promotion::VARCHAR, 
            promo_record.valeur, 
            'Code promo valide'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS SUPPLÉMENTAIRES
-- =============================================

-- Trigger pour incrémenter le compteur d'utilisations des promos
CREATE OR REPLACE FUNCTION increment_promo_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code_promo IS NOT NULL THEN
        UPDATE promotions
        SET nombre_utilisations = nombre_utilisations + 1
        WHERE code_promo = NEW.code_promo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Ce trigger sera appliqué quand vous aurez une colonne code_promo dans commandes
-- CREATE TRIGGER trigger_increment_promo_usage
--     AFTER INSERT ON commandes
--     FOR EACH ROW
--     WHEN (NEW.code_promo IS NOT NULL)
--     EXECUTE FUNCTION increment_promo_usage();

-- Trigger pour logger les actions importantes
CREATE OR REPLACE FUNCTION log_important_actions()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_activites (
            id_utilisateur,
            action,
            table_affectee,
            id_enregistrement,
            details
        ) VALUES (
            COALESCE(NEW.id_utilisateur, auth.uid()),
            TG_OP || ' on ' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_activites (
            id_utilisateur,
            action,
            table_affectee,
            id_enregistrement,
            details
        ) VALUES (
            auth.uid(),
            TG_OP || ' on ' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger de log sur les tables sensibles
CREATE TRIGGER trigger_log_commandes
    AFTER INSERT OR UPDATE ON commandes
    FOR EACH ROW
    EXECUTE FUNCTION log_important_actions();

CREATE TRIGGER trigger_log_users
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_important_actions();

-- =============================================
-- INDEXES SUPPLÉMENTAIRES POUR PERFORMANCES
-- =============================================

-- Index pour les recherches textuelles
CREATE INDEX idx_produits_nom_search ON produits USING gin(to_tsvector('french', nom));
CREATE INDEX idx_produits_description_search ON produits USING gin(to_tsvector('french', description));

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_commandes_utilisateur_date ON commandes(id_utilisateur, date_commande DESC);
CREATE INDEX idx_commandes_statut_date ON commandes(statut, date_commande DESC);
CREATE INDEX idx_details_commande_produit ON details_commande(id_produit, id_commande);

-- =============================================
-- COMMENTAIRES SUR LES TABLES
-- =============================================

COMMENT ON TABLE users IS 'Table principale des utilisateurs avec tous les rôles';
COMMENT ON TABLE categories IS 'Catégories de produits du menu';
COMMENT ON TABLE produits IS 'Produits et plats disponibles au restaurant';
COMMENT ON TABLE commandes IS 'Commandes passées par les clients';
COMMENT ON TABLE details_commande IS 'Détails des articles dans chaque commande';
COMMENT ON TABLE historique_points IS 'Historique de toutes les transactions de points de fidélité';
COMMENT ON TABLE parrainages IS 'Système de parrainage entre utilisateurs';
COMMENT ON TABLE reclamations IS 'Réclamations et plaintes des clients';
COMMENT ON TABLE promotions IS 'Promotions et codes promo actifs';
COMMENT ON TABLE evenements IS 'Événements et jeux organisés par le restaurant';
COMMENT ON TABLE participations_evenements IS 'Participation des utilisateurs aux événements';
COMMENT ON TABLE parametres IS 'Paramètres de configuration de l application';
COMMENT ON TABLE horaires IS 'Horaires d ouverture du restaurant';
COMMENT ON TABLE logs_activites IS 'Journal d audit des actions importantes';

-- =============================================
-- FIN DU SCRIPT
-- =============================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE ' Base de données Mon Miam Miam créée avec succès!';
    RAISE NOTICE ' Tables créées: 13';
    RAISE NOTICE ' Fonctions créées: 12';
    RAISE NOTICE ' Triggers créés: 5';
    RAISE NOTICE ' Vues créées: 3';
    RAISE NOTICE ' RLS activé sur toutes les tables';
    RAISE NOTICE '';
    RAISE NOTICE ' Prochaines étapes:';
    RAISE NOTICE '1. Configurez Supabase Auth';
    RAISE NOTICE '2. Créez les buckets de storage pour les images';
    RAISE NOTICE '3. Testez les connexions depuis votre frontend';
    RAISE NOTICE '4. Ajoutez des données de test';
END $$;