# 🚀 Guide de Déploiement Frontend sur Vercel

Guide étape par étape pour déployer votre frontend SkillFusion sur Vercel.

---

## 📋 Prérequis

- ✅ Compte GitHub avec votre code poussé
- ✅ Compte Vercel (gratuit) : [vercel.com](https://vercel.com)
- ✅ Backend déployé sur Render (pour l'URL de l'API)
- ✅ Votre frontend fonctionne en local

---

## 🎯 Étape 1 : Préparer le projet

### 1.1 Vérifier la configuration

Assurez-vous que votre projet utilise bien les variables d'environnement :

- ✅ `VITE_API_URL` est utilisé dans `src/services/axios.js`
- ✅ Le fichier `.env.example` existe (créé automatiquement)
- ✅ Le fichier `.env` est dans `.gitignore` (ne sera pas versionné)

### 1.2 Tester le build localement

Avant de déployer, testez que le build fonctionne :

```bash
cd SkillFusion/Front
npm install
npm run build
```

Si le build réussit, vous êtes prêt pour Vercel ! ✅

---

## 🎯 Étape 2 : Créer un compte Vercel

1. **Allez sur** : [vercel.com](https://vercel.com)
2. **Cliquez sur** : "Sign Up"
3. **Choisissez** : "Continue with GitHub" (recommandé)
4. **Autorisez** Vercel à accéder à votre compte GitHub

---

## 🎯 Étape 3 : Importer votre projet

1. **Dashboard Vercel** → Cliquez sur **"Add New..."** → **"Project"**

2. **Importez depuis GitHub** :
   - Sélectionnez votre repository : `skillfusion-perso`
   - Vercel détectera automatiquement que c'est un projet Vite

3. **Configurez le projet** :
   - **Framework Preset** : Vite (détecté automatiquement)
   - **Root Directory** : `SkillFusion/Front` ⚠️ **IMPORTANT**
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `dist` (par défaut)
   - **Install Command** : `npm install` (par défaut)

---

## 🎯 Étape 4 : Configurer les variables d'environnement

Dans la section **"Environment Variables"** avant de déployer :

### Variable obligatoire :

```env
VITE_API_URL=https://votre-backend.onrender.com
```

**Remplacez** `votre-backend.onrender.com` par l'URL réelle de votre backend Render.

**Exemple** :
```env
VITE_API_URL=https://skillfusion-backend.onrender.com
```

### Comment obtenir l'URL de votre backend ?

1. Allez sur votre dashboard Render
2. Ouvrez votre service web backend
3. Copiez l'URL (format : `https://nom-du-service.onrender.com`)

---

## 🎯 Étape 5 : Déployer

1. **Cliquez sur** : **"Deploy"**

2. **Vercel va automatiquement** :
   - Installer les dépendances (`npm install`)
   - Builder le projet (`npm run build`)
   - Déployer sur leur CDN

3. **Attendez** quelques secondes/minutes...

4. **Une fois terminé**, vous obtiendrez une URL comme :
   ```
   https://skillfusion-perso.vercel.app
   ```

---

## 🎯 Étape 6 : Configurer le backend pour accepter les requêtes depuis Vercel

### Important : Mettre à jour CORS dans votre backend

1. **Allez sur Render** → votre service backend
2. **Section "Environment"** → Variable `FRONTEND_URL`
3. **Mettez à jour** avec l'URL Vercel :
   ```env
   FRONTEND_URL=https://skillfusion-perso.vercel.app
   ```
4. **Redéployez** le backend (Render redéploiera automatiquement)

---

## 🎯 Étape 7 : Tester votre application

1. **Ouvrez** l'URL Vercel de votre frontend
2. **Testez** :
   - ✅ La page d'accueil s'affiche
   - ✅ Vous pouvez vous inscrire
   - ✅ Vous pouvez vous connecter
   - ✅ Les données se chargent depuis le backend

---

## 🔧 Configuration avancée (optionnel)

### Configuration via `vercel.json`

Si vous avez besoin de personnaliser le déploiement, le fichier `vercel.json` est déjà créé :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Explication** :
- `rewrites` : Redirige toutes les routes vers `index.html` (nécessaire pour React Router)

### Variables d'environnement par environnement

Vous pouvez configurer des variables différentes pour :
- **Production** : URL du backend Render
- **Preview** (branches) : URL du backend de test
- **Development** : URL locale

Dans Vercel Dashboard → Settings → Environment Variables, vous pouvez choisir pour quel environnement chaque variable s'applique.

---

## 🔧 Résolution des Problèmes Courants

### ❌ Erreur "Failed to fetch" ou CORS

**Cause** : Le backend n'accepte pas les requêtes depuis Vercel.

**Solution** :
1. Vérifiez que `FRONTEND_URL` dans Render contient bien l'URL Vercel
2. Vérifiez que `VITE_API_URL` dans Vercel contient bien l'URL Render
3. Redéployez le backend après modification de `FRONTEND_URL`

### ❌ Erreur "Module not found" lors du build

**Cause** : Dépendances manquantes ou problème de chemin.

**Solution** :
1. Vérifiez que `Root Directory` est bien `SkillFusion/Front`
2. Vérifiez que tous les imports utilisent des chemins relatifs corrects
3. Testez le build localement : `npm run build`

### ❌ Les routes ne fonctionnent pas (404)

**Cause** : Vercel ne redirige pas les routes vers `index.html`.

**Solution** :
- Le fichier `vercel.json` avec les `rewrites` devrait résoudre ce problème
- Vérifiez que `vercel.json` est bien à la racine de `SkillFusion/Front`

### ❌ Les images ne s'affichent pas

**Cause** : Chemins d'images incorrects.

**Solution** :
1. Vérifiez que les images sont dans le dossier `public/`
2. Utilisez des chemins relatifs depuis `public/` : `/Images/logo.png`
3. Ou utilisez `import` pour les images dans `src/`

---

## 📝 Checklist de Déploiement

Avant de déployer, vérifiez :

- [ ] ✅ Votre code est poussé sur GitHub
- [ ] ✅ Le build fonctionne en local (`npm run build`)
- [ ] ✅ Le backend est déployé sur Render
- [ ] ✅ Vous avez l'URL de votre backend Render
- [ ] ✅ Vous avez créé un compte Vercel
- [ ] ✅ Vous avez configuré `VITE_API_URL` dans Vercel avec l'URL Render
- [ ] ✅ Vous avez configuré `FRONTEND_URL` dans Render avec l'URL Vercel
- [ ] ✅ Le `Root Directory` est bien `SkillFusion/Front`

---

## 🎉 Félicitations !

Votre frontend est maintenant déployé sur Vercel ! 🚀

**Prochaines étapes** :
1. Testez toutes les fonctionnalités
2. Configurez un domaine personnalisé (optionnel)
3. Activez les déploiements automatiques (déjà activé par défaut)

---

## 🔄 Déploiements automatiques

Par défaut, Vercel déploie automatiquement :
- ✅ **Chaque push sur `master/main`** → Déploiement en production
- ✅ **Chaque Pull Request** → Déploiement de preview (URL temporaire)

Vous pouvez désactiver cela dans Settings → Git si besoin.

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Guide Vite sur Vercel](https://vercel.com/docs/frameworks/vite)
- [Variables d'environnement Vercel](https://vercel.com/docs/environment-variables)

---

## 💡 Astuces

1. **Domaine personnalisé** : Vous pouvez ajouter votre propre domaine dans Settings → Domains
2. **Analytics** : Vercel offre des analytics gratuits sur l'utilisation de votre site
3. **Preview Deployments** : Chaque PR crée une URL de preview pour tester avant de merger
4. **Rollback** : Vous pouvez revenir à une version précédente en un clic dans le dashboard

