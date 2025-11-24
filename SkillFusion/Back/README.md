# SkillFusion - Backend API

API REST pour la plateforme SkillFusion développée avec Node.js, Express, Sequelize et PostgreSQL.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Démarrage](#démarrage)
5. [Structure du projet](#structure-du-projet)
6. [Base de données](#base-de-données)
7. [Authentification](#authentification)
8. [Routes API](#routes-api)
9. [Tests](#tests)
10. [Scripts disponibles](#scripts-disponibles)

---

## Prérequis

- **Node.js** >= 18
- **PostgreSQL** >= 12
- **npm** ou **yarn**

---

## Installation

```bash
cd SkillFusion/Back
npm install
```

---

## Configuration

Créez un fichier `.env` à la racine du dossier `Back/` en vous basant sur `env.example` :

```env
# Configuration de la base de données PostgreSQL
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Configuration JWT
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRES_IN=7d

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration CORS (pour le frontend)
FRONTEND_URL=http://localhost:5173
```

**Note** : Le projet utilise uniquement PostgreSQL. La configuration se fait via `PG_URL` (format URL complète).

---

## Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`).

### Mode production

```bash
npm start
```

---

## Structure du projet

```
Back/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration connexion PostgreSQL
│   ├── controllers/             # Contrôleurs (logique métier)
│   │   ├── authenticationController.js
│   │   ├── lessonController.js
│   │   ├── categoryController.js
│   │   ├── accountController.js
│   │   ├── forumController.js
│   │   └── uploadController.js
│   ├── middlewares/             # Middlewares Express
│   │   ├── authenticateToken.js    # Authentification JWT
│   │   ├── authorizeRole.js         # Autorisation par rôles
│   │   ├── validation.js            # Validation Joi
│   │   ├── corsConfig.js            # Configuration CORS
│   │   ├── errorHandler.js          # Gestion d'erreurs
│   │   └── upload.js                # Gestion upload fichiers
│   ├── models/                  # Modèles Sequelize
│   │   ├── association.js       # Associations entre modèles
│   │   ├── User.js
│   │   ├── Lesson.js
│   │   ├── Category.js
│   │   ├── Step.js
│   │   ├── Material.js
│   │   ├── Topic.js
│   │   ├── Reply.js
│   │   └── Role.js
│   ├── migrations/              # Migrations base de données
│   │   └── createTables.js      # Création des tables
│   ├── seeders/                 # Seeders pour données de test
│   │   ├── seed-roles.js
│   │   ├── seed-users.js
│   │   ├── seed-categories.js
│   │   ├── seed-lessons.js
│   │   ├── seed-steps.js
│   │   ├── seed-materials.js
│   │   ├── seed-topics.js
│   │   ├── seed-replies.js
│   │   └── seed-favorites.js
│   └── router.js                # Définition des routes API
├── tests/                       # Tests Jest
├── scripts/                     # Scripts utilitaires
│   ├── sync-db.js              # Synchronisation BDD Render → Local
│   ├── switch-db.js             # Basculement entre BDD locales/Render
│   └── test-connection.js      # Test de connexion BDD
├── uploads/                     # Dossier de stockage des fichiers uploadés
├── package.json
└── .env                         # Variables d'environnement (à créer)
```

---

## Base de données

### Création et initialisation

**Reset complet** (re-crée le schéma puis seed les données) :
```bash
npm run db:reset
```

**Étapes séparées** :
```bash
# 1. Créer les tables
npm run db:create

# 2. Seed les données (dans l'ordre)
npm run db:seed:roles
npm run db:seed:users
npm run db:seed:categories
npm run db:seed:lessons
npm run db:seed:steps
npm run db:seed:materials
npm run db:seed:topics
npm run db:seed:replies
npm run db:seed:favorites

# Ou seed complet en une commande
npm run db:seed
```

### Ordre d'exécution des seeders

Les seeders doivent être exécutés dans cet ordre à cause des dépendances :
1. `roles` → 2. `users` → 3. `categories` → 4. `lessons` → 5. `steps` / `materials` → 6. `topics` → 7. `replies` → 8. `favorites`

### Idempotence

Les seeders vérifient l'existence avant insertion (`findOrCreate`), donc vous pouvez les relancer sans créer de doublons.

### Scripts de synchronisation

**Synchroniser la BDD Render vers local** :
```bash
npm run db:sync
```

**Basculer entre BDD locale et Render** :
```bash
npm run db:switch:local   # Active la BDD locale
npm run db:switch:render  # Active la BDD Render
```

---

## Authentification

### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Connexion réussie"
}
```

### Utilisation du token

Ajoutez le token dans les headers des requêtes protégées :
```http
Authorization: Bearer <token>
```

### Profil utilisateur courant

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Routes API

### Routes publiques

- `GET /` : Vérification que l'API fonctionne
- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion
- `GET /api/lessons` : Liste des leçons publiées
- `GET /api/lessons/:id` : Détail d'une leçon
- `GET /api/categories` : Liste des catégories
- `GET /api/categories/:id` : Détail d'une catégorie
- `GET /api/categories/:id/lessons` : Leçons d'une catégorie

### Routes protégées (authentification requise)

- `GET /api/auth/me` : Profil utilisateur courant
- `POST /api/lessons/:id/favorite` : Ajouter aux favoris
- `DELETE /api/lessons/:id/favorite` : Retirer des favoris
- `GET /api/users/profile` : Profil utilisateur
- `PATCH /api/users/profile` : Modifier le profil

### Routes admin/instructeur

- `POST /api/lessons` : Créer une leçon
- `PATCH /api/lessons/:id` : Modifier une leçon
- `DELETE /api/lessons/:id` : Supprimer une leçon
- `POST /api/categories` : Créer une catégorie
- `PATCH /api/categories/:id` : Modifier une catégorie
- `DELETE /api/categories/:id` : Supprimer une catégorie

### Routes admin uniquement

- `GET /api/users` : Liste de tous les utilisateurs
- `GET /api/users/:id` : Détail d'un utilisateur
- `PATCH /api/users/:id` : Modifier un utilisateur

**Documentation complète** : Voir `DOCUMENTATION TECHNIQUE/GUIDE_ROUTES_API.md`

---

## Tests

### Exécuter les tests

```bash
# Tous les tests
npm test

# Mode watch (re-exécution automatique)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage
```

### Structure des tests

- **Tests unitaires** : `tests/*.test.js`
- **Tests d'intégration** : `tests/integration*.test.js`

**Guide complet** : Voir `DOCUMENTATION TECHNIQUE/GUIDE_TESTS.md`

---

## Scripts disponibles

### Développement

- `npm run dev` : Démarre le serveur en mode watch
- `npm start` : Démarre le serveur en production

### Base de données

- `npm run db:create` : Crée les tables (drop + sync)
- `npm run db:reset` : Reset complet (create + seed)
- `npm run db:seed` : Seed toutes les données
- `npm run db:seed:roles` : Seed uniquement les rôles
- `npm run db:seed:users` : Seed uniquement les utilisateurs
- `npm run db:seed:categories` : Seed uniquement les catégories
- `npm run db:seed:lessons` : Seed uniquement les leçons
- `npm run db:seed:steps` : Seed uniquement les étapes
- `npm run db:seed:materials` : Seed uniquement les matériaux
- `npm run db:seed:topics` : Seed uniquement les sujets de forum
- `npm run db:seed:replies` : Seed uniquement les réponses
- `npm run db:seed:favorites` : Seed uniquement les favoris
- `npm run db:sync` : Synchronise BDD Render → Local
- `npm run db:switch:local` : Bascule vers BDD locale
- `npm run db:switch:render` : Bascule vers BDD Render

### Tests

- `npm test` : Exécute tous les tests
- `npm run test:watch` : Tests en mode watch
- `npm run test:coverage` : Tests avec rapport de couverture

---

## Modèles et associations

Les modèles Sequelize et leurs associations sont définis dans `src/models/association.js`.

**Relations principales** :
- User ↔ Role (Many-to-One)
- User ↔ Lesson (One-to-Many)
- User ↔ Lesson via Favorite (Many-to-Many)
- Lesson ↔ Category (Many-to-One)
- Lesson ↔ Step (One-to-Many)
- Lesson ↔ Material (One-to-Many)
- User ↔ Topic (One-to-Many)
- Topic ↔ Reply (One-to-Many)
- User ↔ Reply (One-to-Many)

---

## Sécurité

### Middlewares de sécurité

- **authenticateToken** : Vérification du token JWT
- **isAdmin** : Vérifie que l'utilisateur est administrateur
- **isInstructor** : Vérifie que l'utilisateur est instructeur
- **isAdminOrInstructor** : Vérifie admin ou instructeur
- **isSelfOrAdmin** : Vérifie que l'utilisateur modifie son propre profil ou est admin
- **isOwnerOrAdmin** : Vérifie la propriété de la ressource ou admin

### Protection implémentée

- ✅ Hachage des mots de passe avec Argon2
- ✅ Validation des données avec Joi
- ✅ Protection XSS avec express-xss-sanitizer
- ✅ Protection contre les injections SQL (Sequelize ORM)
- ✅ Gestion des rôles et autorisations granulaire

**Documentation sécurité** : Voir `DOCUMENTATION TECHNIQUE/FICHE_VULNERABILITES_SECURITE.md`

---

## Dépannage

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env` (PG_URL)
- Testez la connexion : `npm run db:create`

### Token invalide ou manquant

- Vérifiez l'en-tête `Authorization: Bearer <token>`
- Régénérez un token via `POST /api/auth/login`
- Après un reset DB, reconnectez-vous (les tokens précédents ne sont plus valides)

### Erreur "Cannot find module"

- Exécutez `npm install`
- Vérifiez que vous êtes dans le bon dossier (`SkillFusion/Back`)

---

## Documentation complète

Pour plus de détails, consultez la documentation dans `DOCUMENTATION TECHNIQUE/` :

- **GUIDE_ROUTES_API.md** : Documentation complète de toutes les routes
- **GUIDE_TESTS.md** : Guide complet des tests
- **GUIDE_DEPLOIEMENT_RENDER.md** : Guide de déploiement
- **FICHE_VULNERABILITES_SECURITE.md** : Sécurité et vulnérabilités
- **FICHE_REQUETES_SQL_SEQUELIZE.md** : Requêtes SQL vs Sequelize
