# Guide : Importer votre base de données Render en local

Ce guide vous explique comment exporter votre base de données PostgreSQL depuis Render et l'importer en local pour un développement plus rapide.

## 📋 Prérequis

1. **PostgreSQL installé localement**
   - Windows : Téléchargez depuis [postgresql.org](https://www.postgresql.org/download/windows/)
   - Ou utilisez Docker : `docker run --name postgres-local -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Outils PostgreSQL en ligne de commande**
   - `pg_dump` et `psql` doivent être dans votre PATH
   - Vérifiez avec : `pg_dump --version` et `psql --version`

3. **Accès à votre base de données Render**
   - URL de connexion depuis le dashboard Render
   - Format : `postgres://user:password@host:port/database`

## 🔄 Étape 1 : Exporter la base de données depuis Render

### Option A : Via pg_dump (recommandé)

1. **Récupérez l'URL de connexion depuis Render**
   - Dashboard Render → Votre service PostgreSQL → "Connections"
   - Copiez l'URL complète (format : `postgres://user:password@host:port/database`)

2. **Exécutez pg_dump depuis votre terminal**

```bash
# Remplacez l'URL par votre URL Render
pg_dump "postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -F c \
  -f backup_render.dump
```

**Explications :**
- `--no-owner` : Ignore les propriétaires (nécessaire pour l'import local)
- `--no-acl` : Ignore les permissions (nécessaire pour l'import local)
- `--clean` : Ajoute des commandes DROP avant CREATE
- `--if-exists` : Utilise IF EXISTS pour éviter les erreurs
- `-F c` : Format custom (binaire, plus rapide)
- `-f backup_render.dump` : Nom du fichier de sortie

### Option B : Via pg_dump en SQL (format texte)

Si vous préférez un fichier SQL lisible :

```bash
pg_dump "postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f backup_render.sql
```

## 🖥️ Étape 2 : Créer la base de données locale

1. **Créez une base de données PostgreSQL locale**

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans le terminal PostgreSQL :
CREATE DATABASE skillfusion;
\q
```

**Ou via la ligne de commande directement :**

```bash
# Windows (PowerShell)
$env:PGPASSWORD='postgres'; psql -U postgres -c "CREATE DATABASE skillfusion;"

# Linux/Mac
PGPASSWORD=postgres psql -U postgres -c "CREATE DATABASE skillfusion;"
```

## 📥 Étape 3 : Importer la base de données en local

### Si vous avez utilisé le format custom (-F c)

```bash
# Remplacez les identifiants par vos identifiants locaux
pg_restore -U postgres -d skillfusion -v backup_render.dump
```

### Si vous avez utilisé le format SQL

```bash
# Remplacez les identifiants par vos identifiants locaux
psql -U postgres -d skillfusion -f backup_render.sql
```

**Si vous avez un mot de passe :**

```bash
# Windows (PowerShell)
$env:PGPASSWORD='postgres'; pg_restore -U postgres -d skillfusion -v backup_render.dump

# Linux/Mac
PGPASSWORD=postgres pg_restore -U postgres -d skillfusion -v backup_render.dump
```

## ⚙️ Étape 4 : Configurer votre fichier .env

Créez ou modifiez votre fichier `.env` dans `SkillFusion/Back/` :

```env
# Base de données locale (sans SSL)
PGHOST=localhost
PGPORT=5432
PGDATABASE=skillfusion
PGUSER=postgres
PGPASSWORD=postgres

# OU en format URL (plus simple)
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Configuration JWT
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRES_IN=24h

# Configuration du serveur
PORT=3000
NODE_ENV=development
```

## ✅ Étape 5 : Vérifier que tout fonctionne

1. **Démarrez votre serveur backend**

```bash
cd SkillFusion/Back
npm run dev
```

2. **Testez une requête API**

```bash
# Par exemple, lister les utilisateurs
curl http://localhost:3000/api/users
```

## 🔄 Synchronisation régulière

Si vous voulez garder votre base locale à jour avec Render :

### Créer un script de synchronisation

Créez un fichier `sync-db.js` dans `SkillFusion/Back/` :

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const RENDER_DB_URL = process.env.RENDER_DB_URL || 'postgres://user:password@host:port/database';
const LOCAL_DB_NAME = 'skillfusion';
const LOCAL_DB_USER = 'postgres';
const BACKUP_FILE = 'backup_render.dump';

async function syncDatabase() {
  try {
    console.log('🔄 Export de la base de données Render...');
    await execAsync(`pg_dump "${RENDER_DB_URL}" --no-owner --no-acl --clean --if-exists -F c -f ${BACKUP_FILE}`);
    
    console.log('📥 Import dans la base locale...');
    await execAsync(`pg_restore -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -v --clean --if-exists ${BACKUP_FILE}`);
    
    console.log('✅ Synchronisation terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
  }
}

syncDatabase();
```

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "db:sync": "node sync-db.js"
  }
}
```

Puis exécutez :

```bash
# Définissez votre URL Render dans .env
RENDER_DB_URL="postgres://..." npm run db:sync
```

## 🐳 Alternative : Utiliser Docker (recommandé)

Si vous préférez utiliser Docker pour PostgreSQL :

### 1. Créer un conteneur PostgreSQL

```bash
docker run --name skillfusion-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=skillfusion \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Importer la base de données

```bash
# Copier le dump dans le conteneur
docker cp backup_render.dump skillfusion-db:/tmp/

# Importer
docker exec -i skillfusion-db pg_restore -U postgres -d skillfusion -v /tmp/backup_render.dump
```

### 3. Votre .env reste le même

```env
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion
```

## ⚠️ Notes importantes

1. **SSL automatiquement désactivé en local**
   - La configuration détecte automatiquement si vous êtes en local (host = localhost)
   - SSL est désactivé pour les connexions locales
   - SSL reste activé pour Render (distant)

2. **Permissions**
   - Si vous avez des erreurs de permissions, utilisez `--no-owner` et `--no-acl`

3. **Port par défaut**
   - Le code utilise le port `5433` par défaut, mais PostgreSQL standard utilise `5432`
   - Vérifiez votre port dans le `.env`

4. **Sauvegarde régulière**
   - N'oubliez pas de sauvegarder votre base locale aussi !
   - Créez un dump local : `pg_dump -U postgres -d skillfusion -F c -f backup_local.dump`

## 🆘 Dépannage

### Erreur : "pg_dump: command not found"
- Installez PostgreSQL ou ajoutez le chemin PostgreSQL au PATH
- Windows : `C:\Program Files\PostgreSQL\15\bin`
- Ou utilisez Docker

### Erreur : "password authentication failed"
- Vérifiez votre mot de passe PostgreSQL
- Utilisez la variable `PGPASSWORD` ou configurez `.pgpass`

### Erreur : "database does not exist"
- Créez d'abord la base de données : `CREATE DATABASE skillfusion;`

### Erreur : "connection refused"
- Vérifiez que PostgreSQL est démarré
- Vérifiez le port (5432 par défaut)
- Windows : Services → PostgreSQL → Démarrer

## 📚 Ressources

- [Documentation pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Documentation pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Documentation Render PostgreSQL](https://render.com/docs/databases)

