// SQL schema for Supabase tables
export const supabaseSchema = `
-- Table: clients
create table if not exists clients (
  id serial primary key,
  nom text not null,
  adresse text,
  ville text,
  province text,
  codepostal text,
  telephone text,
  courriel text,
  actif boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Table: employes
create table if not exists employes (
  id serial primary key,
  nom_employe text not null,
  initiales text,
  couleur_secondaire text,
  actif boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Table: salles
create table if not exists salles (
  id serial primary key,
  description text,
  actif boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Table: services
create table if not exists services (
  id serial primary key,
  categorie text,
  description text,
  dureeminutes int,
  prix numeric,
  employes_competents text,
  salle_id int references salles(id),
  actif boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Table: rendez_vous
create table if not exists rendez_vous (
  id serial primary key,
  client_id int references clients(id),
  service_id int references services(id),
  employe_id int references employes(id),
  salle_id int references salles(id),
  date_heure timestamp not null,
  duree int,
  statut text default 'actif',
  notes text,
  prix numeric,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Table: produits
create table if not exists produits (
  id serial primary key,
  nom text not null,
  description text,
  prix numeric,
  actif boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
`;