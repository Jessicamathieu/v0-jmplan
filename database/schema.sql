-- Création des tables Supabase/PostgreSQL pour JM Plan

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  specialites TEXT[],
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des salles
CREATE TABLE IF NOT EXISTS salles (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  capacite INTEGER DEFAULT 1,
  equipements TEXT[],
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services (mise à jour)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  duree INTEGER NOT NULL, -- en minutes
  couleur VARCHAR(7) DEFAULT '#3B82F6',
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clients (mise à jour)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  date_naissance DATE,
  notes TEXT,
  points_fidelite INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email) WHERE email IS NOT NULL,
  UNIQUE(telephone) WHERE telephone IS NOT NULL
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  employe_id INTEGER REFERENCES employes(id) ON DELETE SET NULL,
  salle_id INTEGER REFERENCES salles(id) ON DELETE SET NULL,
  date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
  duree INTEGER NOT NULL, -- en minutes
  statut VARCHAR(20) DEFAULT 'confirme' CHECK (statut IN ('confirme', 'annule', 'reporte', 'termine')),
  notes TEXT,
  prix DECIMAL(10,2),
  google_event_id VARCHAR(255), -- Pour la sync Google Calendar
  rappel_envoye BOOLEAN DEFAULT false,
  confirmation_envoyee BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les tokens Google Calendar
CREATE TABLE IF NOT EXISTS google_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- Peut être l'email ou un ID utilisateur
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date_heure);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_client ON rendez_vous(client_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_service ON rendez_vous(service_id);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_employe ON rendez_vous(employe_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone) WHERE telephone IS NOT NULL;

-- Données de test pour les employés
INSERT INTO employes (nom, prenom, email, telephone, specialites) VALUES
('Mathieu', 'Jessica', 'jessica@jmplan.com', '514-555-0001', ARRAY['Consultation', 'Suivi']),
('Dupont', 'Marie', 'marie.dupont@jmplan.com', '514-555-0002', ARRAY['Bilan', 'Thérapie'])
ON CONFLICT (email) DO NOTHING;

-- Données de test pour les salles
INSERT INTO salles (nom, capacite, equipements) VALUES
('Salle 1', 1, ARRAY['Bureau', 'Chaise', 'Ordinateur']),
('Salle 2', 2, ARRAY['Table', 'Chaises', 'Tableau']),
('Salle Virtuelle', 10, ARRAY['Zoom', 'Teams'])
ON CONFLICT DO NOTHING;

-- Données de test pour les services
INSERT INTO services (nom, description, prix, duree, couleur) VALUES
('Consultation initiale', 'Première consultation avec évaluation complète', 120.00, 90, '#3B82F6'),
('Suivi régulier', 'Séance de suivi thérapeutique', 80.00, 60, '#10B981'),
('Bilan complet', 'Évaluation approfondie avec rapport', 200.00, 120, '#F59E0B'),
('Thérapie de groupe', 'Séance en groupe (max 6 personnes)', 50.00, 90, '#8B5CF6')
ON CONFLICT DO NOTHING;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employes_updated_at BEFORE UPDATE ON employes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salles_updated_at BEFORE UPDATE ON salles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rendez_vous_updated_at BEFORE UPDATE ON rendez_vous FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_google_tokens_updated_at BEFORE UPDATE ON google_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
