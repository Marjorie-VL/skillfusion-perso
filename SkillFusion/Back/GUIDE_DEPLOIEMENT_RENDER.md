# 🚀 Guide de Déploiement Backend sur Render

Guide étape par étape pour déployer votre backend SkillFusion sur Render.

---

## 📋 Prérequis

- ✅ Compte GitHub avec votre code poussé
- ✅ Compte Render (gratuit) : [render.com](https://render.com)
- ✅ Votre backend fonctionne en local

---

## 🎯 Étape 1 : Créer la Base de Données PostgreSQL

1. **Connectez-vous à Render** : [dashboard.render.com](https://dashboard.render.com)

2. **Créez une nouvelle base de données** :
   - Cliquez sur **"New +"** → **"PostgreSQL"**
   - **Name** : `skillfusion-db`
   - **Database** : `skillfusion` (ou laissez par défaut)
   - **User** : `skillfusion_user` (ou laissez par défaut)
   - **Region** : **Europe (Frankfurt)** (recommandé pour la France)
   - **Plan** : **Free**
   - Cliquez sur **"Create Database"**

3. **Récupérez l'URL de connexion** :
   - Une fois créée, allez dans votre base de données
   - Copiez l'**"External Database URL"** (format : `postgresql://user:password@host:port/database`)
   - ⚠️ **Gardez cette URL secrète !**

---

## 🎯 Étape 2 : Créer le Service Web

1. **Créez un nouveau service web** :
   - Cliquez sur **"New +"** → **"Web Service"**
   - **Connect GitHub** : Autorisez Render à accéder à votre repository
   - Sélectionnez votre repository : `skillfusion-perso`

2. **Configurez le service** :
   - **Name** : `skillfusion-backend`
   - **Environment** : **Node**
   - **Region** : **Europe (Frankfurt)** (même région que la DB)
   - **Branch** : `master` (ou `main` selon votre repo)
   - **Root Directory** : `SkillFusion/Back` ⚠️ **IMPORTANT**
   - **Build Command** : `npm install && npm run db:create && npm run db:seed`
   - **Start Command** : `npm start`
   - **Plan** : **Free**

---

## 🎯 Étape 3 : Configurer les Variables d'Environnement

Dans la section **"Environment"** de votre service web, ajoutez ces variables :

### Variables obligatoires :

```env
NODE_ENV=production
PORT=3000
ACCESS_TOKEN_SECRET=<générez une clé secrète aléatoire>
ACCESS_TOKEN_EXPIRES_IN=24h
PG_URL=<collez l'URL de votre base de données PostgreSQL>
FRONTEND_URL=<URL de votre frontend déployé, ex: https://votre-frontend.vercel.app>
```

### Comment obtenir chaque variable :

- **`NODE_ENV`** : `production`
- **`PORT`** : `3000` (Render définit automatiquement le port, mais on le met quand même)
- **`ACCESS_TOKEN_SECRET`** : 
  - Cliquez sur **"Generate"** dans Render, OU
  - Générez une clé locale : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **`ACCESS_TOKEN_EXPIRES_IN`** : `24h` (ou `7d`, `30d`, etc.)
- **`PG_URL`** : Copiez l'**"External Database URL"** de votre base de données Render
- **`FRONTEND_URL`** : L'URL de votre frontend déployé (ex: Vercel, Netlify, etc.)

### ⚠️ Option 1 : Utiliser render.yaml (Recommandé)

Si vous utilisez le fichier `render.yaml`, Render configurera automatiquement :
- ✅ `PG_URL` sera lié à votre base de données
- ✅ `ACCESS_TOKEN_SECRET` sera généré automatiquement
- ⚠️ Vous devrez quand même mettre à jour `FRONTEND_URL` manuellement

### ⚠️ Option 2 : Configuration manuelle

Si vous ne voulez pas utiliser `render.yaml`, configurez toutes les variables manuellement dans le dashboard Render.

---

## 🎯 Étape 4 : Déployer

1. **Sauvegardez la configuration** :
   - Cliquez sur **"Create Web Service"** (ou **"Save Changes"** si vous modifiez)

2. **Suivez le déploiement** :
   - Render va automatiquement :
     - Cloner votre code depuis GitHub
     - Installer les dépendances (`npm install`)
     - Créer les tables (`npm run db:create`)
     - Peupler la base de données (`npm run db:seed`)
     - Démarrer le serveur (`npm start`)

3. **Vérifiez les logs** :
   - Allez dans l'onglet **"Logs"** de votre service
   - Vous devriez voir :
     ```
     ✅ Database connection established successfully
     ✅ Tables créées avec succès !
     🚀 Server started at http://localhost:3000
     ```

---

## 🎯 Étape 5 : Tester votre API

Une fois déployé, votre API sera accessible à :
```
https://skillfusion-backend.onrender.com
```

### Tests à effectuer :

1. **Test de santé** :
   ```bash
   curl https://skillfusion-backend.onrender.com/api
   ```

2. **Test des catégories** :
   ```bash
   curl https://skillfusion-backend.onrender.com/api/categories
   ```

3. **Test d'inscription** :
   ```bash
   curl -X POST https://skillfusion-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!","user_name":"TestUser"}'
   ```

---

## 🔧 Résolution des Problèmes Courants

### ❌ Erreur "SSL/TLS required"

**Cause** : La connexion PostgreSQL nécessite SSL sur Render.

**Solution** : Vérifiez que `src/models/connection.js` contient :
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### ❌ Erreur "Missing script: build"

**Cause** : Le script `build` n'existe pas dans `package.json`.

**Solution** : Vérifiez que votre `package.json` contient :
```json
{
  "scripts": {
    "build": "npm run db:create && npm run db:seed",
    "start": "node index.js"
  }
}
```

### ❌ Erreur CORS

**Cause** : Le frontend n'est pas autorisé dans la configuration CORS.

**Solution** : 
1. Vérifiez que `FRONTEND_URL` est bien configuré dans Render
2. Vérifiez que l'URL correspond exactement à celle de votre frontend (avec `https://`)

### ❌ Erreur "Database connection failed"

**Cause** : L'URL de la base de données est incorrecte.

**Solution** :
1. Vérifiez que `PG_URL` est bien configuré dans Render
2. Vérifiez que l'URL est au format : `postgresql://user:password@host:port/database`
3. Utilisez l'**"External Database URL"** (pas l'Internal)

### ❌ Le service se met en "sleep" après 15 minutes

**Cause** : Sur le plan gratuit, Render met les services en veille après 15 minutes d'inactivité.

**Solution** :
- C'est normal sur le plan gratuit
- Le premier appel après le sleep prendra quelques secondes (réveil)
- Pour éviter le sleep, utilisez un service de "ping" (ex: UptimeRobot)

---

## 📝 Checklist de Déploiement

Avant de déployer, vérifiez :

- [ ] ✅ Votre code est poussé sur GitHub
- [ ] ✅ La base de données PostgreSQL est créée sur Render
- [ ] ✅ Le service web est créé avec le bon **Root Directory** (`SkillFusion/Back`)
- [ ] ✅ Les variables d'environnement sont configurées :
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `ACCESS_TOKEN_SECRET` (généré)
  - [ ] `ACCESS_TOKEN_EXPIRES_IN=24h`
  - [ ] `PG_URL` (URL de la base de données)
  - [ ] `FRONTEND_URL` (URL de votre frontend)
- [ ] ✅ Le **Build Command** est : `npm install && npm run db:create && npm run db:seed`
- [ ] ✅ Le **Start Command** est : `npm start`
- [ ] ✅ La configuration SSL est présente dans `src/models/connection.js`
- [ ] ✅ La configuration CORS utilise `FRONTEND_URL`

---

## 🎉 Félicitations !

Votre backend est maintenant déployé sur Render ! 🚀

**Prochaines étapes** :
1. Testez tous vos endpoints
2. Configurez votre frontend pour utiliser l'URL Render
3. Mettez à jour `FRONTEND_URL` dans Render avec l'URL de votre frontend déployé

---

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Guide de déploiement complet](./DOCUMENTATION%20TECHNIQUE/GUIDE_DEPLOIEMENT_RENDER.md)
- [README Backend](./README.md)

