# JM Plan - Application de Gestion Premium

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jessica-mathieus-projects/v0-jmplan)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/q1h9PAzFfYA)

## 🌟 Vue d'ensemble

JM Plan est une application de gestion premium développée avec Next.js 14, TypeScript, et Supabase. Elle offre une interface moderne avec un design dégradé rose/violet et des fonctionnalités avancées pour la gestion de clients, rendez-vous, et synchronisation Google Calendar.

## 🚀 Fonctionnalités

- ✅ **Gestion des clients** avec import CSV/Excel
- ✅ **Gestion des rendez-vous** avec calendrier interactif
- ✅ **Synchronisation Google Calendar** bidirectionnelle
- ✅ **Import/Export** de données en masse
- ✅ **Interface premium** avec animations et dégradés
- ✅ **Base de données Supabase/PostgreSQL**
- ✅ **API REST complète**
- ✅ **Tests unitaires** et validation

## 🛠️ Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui, Lucide Icons
- **Backend**: Next.js API Routes, Supabase
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: Google OAuth2
- **Déploiement**: Vercel

## 📋 Prérequis

- Node.js 18+ ou Bun
- Compte Supabase
- Compte Google Cloud (pour Calendar API)
- Compte Vercel (pour le déploiement)

## ⚙️ Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

# Base de données (fournie par Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
\`\`\`

## 🗄️ Configuration de la base de données

### 1. Créer les tables Supabase

Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

\`\`\`sql
-- Voir le fichier database/schema.sql pour le script complet
\`\`\`

### 2. Configurer les politiques RLS (Row Level Security)

\`\`\`sql
-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE salles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Créer des politiques permissives pour le développement
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON employes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON salles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON rendez_vous FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON google_tokens FOR ALL USING (true);
\`\`\`

## 🔧 Installation et développement

### 1. Cloner le projet

\`\`\`bash
git clone https://github.com/your-username/jmplan.git
cd jmplan
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
# ou
bun install
\`\`\`

### 3. Configurer les variables d'environnement

Copiez `.env.example` vers `.env.local` et remplissez les valeurs.

### 4. Lancer le serveur de développement

\`\`\`bash
npm run dev
# ou
bun dev
\`\`\`

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## 📊 Import de données

### Import de clients

1. Allez dans **Clients** → **Importer**
2. Formats supportés : CSV, XLS, XLSX
3. Colonnes requises : `nom`, `prenom`
4. Colonnes optionnelles : `email`, `telephone`, `adresse`, `date_naissance`, `notes`

**Exemple de fichier CSV :**
\`\`\`csv
nom,prenom,email,telephone,adresse
Dupont,Marie,marie@example.com,514-555-0001,"123 Rue Example, Montréal"
Martin,Jean,jean@example.com,514-555-0002,"456 Ave Test, Québec"
\`\`\`

### Import de services

1. Allez dans **Services** → **Importer**
2. Colonnes requises : `nom`, `prix`, `duree`
3. Colonnes optionnelles : `description`, `couleur`

**Exemple de fichier CSV :**
\`\`\`csv
nom,description,prix,duree,couleur
Consultation,Première consultation,120.00,90,#3B82F6
Suivi,Séance de suivi,80.00,60,#10B981
\`\`\`

## 📅 Synchronisation Google Calendar

### 1. Configuration Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar
4. Créez des identifiants OAuth 2.0
5. Ajoutez votre domaine aux origines autorisées
6. Configurez l'URI de redirection : `https://votre-domaine.com/api/google/callback`

### 2. Activer la synchronisation

1. Allez dans **Paramètres** → **Intégrations**
2. Cliquez sur **Connecter Google Calendar**
3. Autorisez l'accès à votre calendrier
4. Sélectionnez le calendrier de destination
5. Configurez la direction de synchronisation :
   - **Bidirectionnelle** : Sync dans les deux sens
   - **Vers Google** : JM Plan → Google Calendar
   - **Depuis Google** : Google Calendar → JM Plan

### 3. Synchronisation automatique

La synchronisation automatique s'exécute toutes les heures si activée. Vous pouvez aussi déclencher une synchronisation manuelle.

## 🧪 Tests

### Lancer les tests

\`\`\`bash
npm test
# ou
bun test
\`\`\`

### Tests de couverture

\`\`\`bash
npm run test:coverage
# ou
bun run test:coverage
\`\`\`

Les tests couvrent :
- ✅ Import Excel/CSV
- ✅ API endpoints
- ✅ Composants React
- ✅ Fonctions utilitaires

## 🚀 Déploiement sur Vercel

### 1. Déploiement automatique

Le projet est configuré pour le déploiement automatique sur Vercel :

\`\`\`bash
npm run build
# ou
bun run build
\`\`\`

### 2. Variables d'environnement Vercel

Ajoutez toutes les variables d'environnement dans le dashboard Vercel :

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez toutes les variables du fichier `.env.local`

### 3. Domaine personnalisé

Pour configurer un domaine personnalisé :

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions
4. Mettez à jour `GOOGLE_REDIRECT_URI` avec votre nouveau domaine

## 📱 Pages disponibles

- **/** - Dashboard avec statistiques
- **/clients** - Gestion des clients
- **/calendrier** - Vue calendrier des rendez-vous
- **/services** - Gestion des services (à venir)
- **/parametres** - Configuration et intégrations

## 🔧 API Endpoints

### Rendez-vous
- `POST /api/rendezvous/create` - Créer un rendez-vous
- `PUT /api/rendezvous/update` - Modifier un rendez-vous
- `DELETE /api/rendezvous/delete` - Supprimer un rendez-vous

### Import
- `POST /api/import/clients` - Importer des clients
- `POST /api/import/services` - Importer des services

### Google Calendar
- `GET /api/google/callback` - Callback OAuth2
- `POST /api/google/sync` - Synchroniser avec Google Calendar

## 🐛 Dépannage

### Erreurs communes

**Erreur de connexion Supabase :**
- Vérifiez les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Assurez-vous que les politiques RLS sont configurées

**Erreur Google Calendar :**
- Vérifiez que l'API Google Calendar est activée
- Vérifiez les identifiants OAuth2
- Vérifiez l'URI de redirection dans Google Cloud Console

**Erreur d'import CSV/Excel :**
- Vérifiez le format des colonnes
- Assurez-vous que les champs requis sont présents
- Vérifiez l'encodage du fichier (UTF-8 recommandé)

**Erreur de build :**
\`\`\`bash
# Nettoyer le cache
rm -rf .next
npm run build
\`\`\`

### Logs et debugging

Pour activer les logs détaillés :

\`\`\`bash
# Développement
DEBUG=* npm run dev

# Production
NODE_ENV=production npm start
\`\`\`

## 📈 Performance

### Optimisations incluses

- ✅ **Lazy loading** des composants
- ✅ **Cache intelligent** pour les API
- ✅ **Compression** des images
- ✅ **Bundle splitting** automatique
- ✅ **Prefetching** des routes

### Monitoring

L'application inclut un monitoring des performances :
- Temps de chargement des pages
- Métriques Web Vitals
- Erreurs JavaScript
- Utilisation mémoire

## 🔒 Sécurité

### Mesures de sécurité

- ✅ **HTTPS** obligatoire en production
- ✅ **Validation** des données côté serveur
- ✅ **Sanitisation** des inputs
- ✅ **Rate limiting** sur les APIs
- ✅ **CORS** configuré correctement

### Bonnes pratiques

- Les tokens Google sont chiffrés en base
- Les mots de passe ne sont jamais stockés en plain text
- Validation stricte des données d'import
- Logs d'audit pour les actions sensibles

## 🤝 Contribution

### Structure du projet

\`\`\`
jmplan/
├── app/                    # Pages et API routes (App Router)
│   ├── api/               # API endpoints
│   ├── calendrier/        # Page calendrier
│   ├── clients/           # Page clients
│   └── parametres/        # Page paramètres
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   └── ...               # Composants métier
├── lib/                  # Utilitaires et services
├── types/                # Types TypeScript
├── database/             # Scripts SQL
└── __tests__/            # Tests unitaires
\`\`\`

### Guidelines de développement

1. **TypeScript strict** - Tous les fichiers doivent être typés
2. **Tests unitaires** - Couverture minimum 80%
3. **ESLint/Prettier** - Code formaté automatiquement
4. **Commits conventionnels** - Format : `type(scope): description`

### Workflow de contribution

1. Fork le projet
2. Créez une branche feature : `git checkout -b feature/nouvelle-fonctionnalite`
3. Committez vos changements : `git commit -m 'feat: ajouter nouvelle fonctionnalité'`
4. Push vers la branche : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrez une Pull Request

## 📞 Support

### Ressources

- **Documentation** : [docs.jmplan.com](https://docs.jmplan.com)
- **Issues GitHub** : [github.com/jmplan/issues](https://github.com/jmplan/issues)
- **Discord** : [discord.gg/jmplan](https://discord.gg/jmplan)

### Contact

- **Email** : support@jmplan.com
- **Site web** : [jmplan.com](https://jmplan.com)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Supabase](https://supabase.com/) pour la base de données
- [Vercel](https://vercel.com/) pour l'hébergement
- [Shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [v0.app](https://v0.app/) pour le développement assisté par IA

---

**Version actuelle :** 1.0.0  
**Dernière mise à jour :** Décembre 2024  
**Statut :** ✅ Production Ready
