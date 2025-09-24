SkillFusion - Backend

## Prérequis
- Node.js >= 18
- Base de données (PostgreSQL ou SQLite selon ta config)
- Fichier `.env` à la racine de `Back/`

Exemple `.env` (adapter selon ton SGBD):
```
# JWT
ACCESS_TOKEN_SECRET=change_me
ACCESS_TOKEN_EXPIRES_IN=7d

# Postgres (exemple)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillfusion
DB_USER=postgres
DB_PASSWORD=postgres

# OU SQLite (exemple)
# DB_DIALECT=sqlite
# DB_STORAGE=./dev.sqlite
```

Notes:
- Si `DB_DIALECT=sqlite`, renseigne `DB_STORAGE`.
- Si `DB_DIALECT=postgres`, renseigne `DB_HOST/PORT/NAME/USER/PASSWORD`.

## Démarrer l’API
```
npm install
npm run dev
```

## Modèles et associations
- Les modèles et associations se trouvent dans `src/models/` (voir `association.js`).

## Migrations et Seeds
Le projet utilise des scripts Node pour créer le schéma et insérer des données.

Scripts principaux (`package.json`):
- Création du schéma (drop + sync):
```
npm run db:create
```
- Seed par lots:
```
npm run db:seed:roles
npm run db:seed:users
npm run db:seed:categories
npm run db:seed:lessons
npm run db:seed:steps
npm run db:seed:materials
npm run db:seed:favorites
```
- Seed complet (enchaîne tous les lots dans le bon ordre):
```
npm run db:seed
```
- Reset complet (re-crée le schéma puis seed):
```
npm run db:reset
```

Ordre d’exécution recommandé en dev:
```
npm run db:create
npm run db:seed
```

### Idempotence des seeders
- Les seeders vérifient l’existence avant insertion (findOrCreate / WHERE NOT EXISTS), donc tu peux les relancer sans créer de doublons.
- Pré-requis entre seeders: `roles` -> `users` -> `categories` -> `lessons` -> `steps/materials` -> `favorites`.

## Authentification
- Login: `POST /login` renvoie un JWT (`token`).
- Profil courant: `GET /me` (Header `Authorization: Bearer <token>`)

## Sécurité des routes
- `PATCH /users/:id`: accessible à l’utilisateur lui-même ou à un administrateur (middleware `isSelfOrAdmin`).
- Actions sur cours/catégories: restreintes à admin/instructor selon route.

## Dépannage
- Token invalide/manquant: vérifier l’en-tête `Authorization: Bearer <token>` et regénérer le token via `/login`.
- Après un reset DB: reconnecte-toi (le token précédent ne correspond plus).

## Scripts utiles
```
npm run start   # démarre en production
npm run dev     # démarre en watch
```

## Structure utile
```
src/
  config/
    database.js           # initialisation connexion DB
  models/
    association.js        # exports + associations
  migrations/
    createTables.js       # drop + sync({ force: true })
  seeders/
    seed-roles.js
    seed-users.js
    seed-categories.js
    seed-lessons.js
    seed-steps.js
    seed-materials.js
    seed-favorites.js
```


