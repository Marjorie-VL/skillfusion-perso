# Guide rapide : Utiliser votre BDD locale

## 🎯 Solution simple

Il suffit de modifier votre fichier `.env` dans `SkillFusion/Back/` pour pointer vers votre base de données locale.

## 📝 Configuration

### 1. Créez votre base de données locale (si pas déjà fait)

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE skillfusion;
\q
```

### 2. Modifiez votre fichier `.env`

Créez ou modifiez `SkillFusion/Back/.env` :

```env
# Base de données LOCALE (rapide !)
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion

# Configuration JWT
ACCESS_TOKEN_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRES_IN=7d

# Configuration serveur
PORT=3000
NODE_ENV=development
```

**Remplacez :**
- `postgres` : votre utilisateur PostgreSQL (généralement `postgres`)
- `postgres` : votre mot de passe PostgreSQL
- `5432` : votre port PostgreSQL (généralement `5432`)
- `skillfusion` : le nom de votre base de données

### 3. C'est tout ! 🎉

Le code détecte automatiquement que vous êtes en local et :
- ✅ Désactive SSL (pas nécessaire en local)
- ✅ Utilise votre base locale
- ✅ Fonctionne beaucoup plus vite !

## 🔄 Basculer entre local et Render

Pour revenir à Render, changez juste `PG_URL` :

```env
# Pour Render
PG_URL=postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx

# Pour local
PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion
```

## 📥 Importer vos données depuis Render

Si vous voulez copier vos données de Render vers local :

### Option 1 : Via pg_dump (recommandé)

```bash
# 1. Exporter depuis Render
pg_dump "postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx" \
  --no-owner --no-acl --clean --if-exists \
  -f backup_render.sql

# 2. Importer en local
psql -U postgres -d skillfusion -f backup_render.sql
```

### Option 2 : Via le script de synchronisation

```bash
# Ajoutez l'URL Render dans votre .env
RENDER_DB_URL="postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/skillfusion_xxxx"

# Lancez la synchronisation
npm run db:sync
```

## ⚙️ Variables d'environnement disponibles

Vous pouvez utiliser **soit** :

1. **Format URL** (le plus simple) :
   ```env
   PG_URL=postgresql://user:password@host:port/database
   ```

2. **Variables séparées** :
   ```env
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=skillfusion
   PGUSER=postgres
   PGPASSWORD=postgres
   ```

## ✅ Vérification

Après avoir configuré votre `.env`, démarrez votre serveur :

```bash
cd SkillFusion/Back
npm run dev
```

Si vous voyez des logs de connexion sans erreur SSL, c'est bon ! 🎉

## 🆘 Dépannage

### Erreur : "password authentication failed"
- Vérifiez votre mot de passe PostgreSQL
- Essayez de vous connecter manuellement : `psql -U postgres`

### Erreur : "database does not exist"
- Créez la base : `CREATE DATABASE skillfusion;`

### Erreur : "connection refused"
- Vérifiez que PostgreSQL est démarré
- Vérifiez le port (5432 par défaut)

### Erreur : "SSL required"
- Vérifiez que votre URL contient `localhost` ou `127.0.0.1`
- Le code détecte automatiquement le local, mais si ça ne marche pas, vérifiez votre `.env`

