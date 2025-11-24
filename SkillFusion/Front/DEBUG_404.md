# 🔧 Guide de Débogage - Erreur 404

Ce guide vous aide à résoudre les erreurs 404 sur votre frontend déployé sur Vercel.

---

## 🔍 Diagnostic de l'erreur 404

L'erreur 404 peut avoir plusieurs causes. Suivez ces étapes pour identifier le problème :

---

## ✅ Étape 1 : Vérifier la variable d'environnement dans Vercel

### Problème le plus courant : `VITE_API_URL` non configuré

1. **Allez sur Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**

2. **Vérifiez** que `VITE_API_URL` existe et contient :
   ```env
   VITE_API_URL=https://votre-backend.onrender.com
   ```
   ⚠️ **Important** : 
   - Pas de `/api` à la fin
   - Pas d'espace avant/après
   - URL complète avec `https://`

3. **Si la variable n'existe pas** :
   - Cliquez sur **"Add New"**
   - Key : `VITE_API_URL`
   - Value : `https://votre-backend.onrender.com`
   - Environment : **Production** (et Preview si besoin)
   - Cliquez sur **"Save"**

4. **Redéployez** après avoir ajouté/modifié la variable :
   - Allez dans **Deployments**
   - Cliquez sur les **3 points** du dernier déploiement
   - **Redeploy**

---

## ✅ Étape 2 : Vérifier que le backend répond

### Testez l'API directement dans votre navigateur :

1. **Ouvrez** : `https://votre-backend.onrender.com/api/categories`
   - Si vous voyez du JSON → ✅ Le backend fonctionne
   - Si vous voyez une erreur → ❌ Le backend a un problème

2. **Testez avec curl** (dans un terminal) :
   ```bash
   curl https://votre-backend.onrender.com/api/categories
   ```

---

## ✅ Étape 3 : Vérifier la configuration CORS dans le backend

### Le backend doit accepter les requêtes depuis Vercel

1. **Allez sur Render** → Votre service backend → **Environment**

2. **Vérifiez** que `FRONTEND_URL` contient l'URL Vercel :
   ```env
   FRONTEND_URL=https://votre-projet.vercel.app
   ```

3. **Si ce n'est pas le cas** :
   - Modifiez `FRONTEND_URL` avec l'URL Vercel
   - Render redéploiera automatiquement

4. **Vérifiez** le fichier `corsConfig.js` dans le backend :
   - Il doit utiliser `FRONTEND_URL` pour autoriser les requêtes

---

## ✅ Étape 4 : Vérifier les logs dans la console du navigateur

### Ouvrez la console (F12) et regardez les logs :

1. **Ouvrez** votre site Vercel
2. **Ouvrez** la console (F12 → Console)
3. **Cherchez** les logs qui commencent par `🔍` :
   ```
   🔍 Configuration API - URL: https://...
   🔍 Configuration API - Base URL: https://.../api
   ```

### Si vous voyez `http://localhost:3000` :
- ❌ La variable `VITE_API_URL` n'est pas configurée dans Vercel
- → Suivez l'Étape 1

### Si vous voyez une URL Render mais erreur 404 :
- Vérifiez que l'URL est correcte (pas de typo)
- Vérifiez que le backend répond (Étape 2)

---

## ✅ Étape 5 : Vérifier la route spécifique qui échoue

### Dans la console, cherchez :
```
❌ Status: 404
📍 URL complète: https://...
📍 Route: /api/...
```

### Routes communes qui peuvent échouer :

1. **`/api/me`** (profil utilisateur)
   - Vérifiez que vous êtes connecté
   - Vérifiez que le token est valide

2. **`/api/lessons`** (liste des cours)
   - Vérifiez que le backend a bien les données
   - Testez directement : `https://backend.onrender.com/api/lessons`

3. **`/api/categories`** (catégories)
   - Testez directement : `https://backend.onrender.com/api/categories`

---

## 🔧 Solutions selon le problème

### Problème 1 : Variable d'environnement manquante

**Symptôme** : Console montre `http://localhost:3000`

**Solution** :
1. Vercel → Settings → Environment Variables
2. Ajoutez `VITE_API_URL=https://votre-backend.onrender.com`
3. Redéployez

---

### Problème 2 : Backend non accessible

**Symptôme** : Erreur réseau dans la console

**Solution** :
1. Vérifiez que le backend Render est bien démarré
2. Testez l'URL directement dans le navigateur
3. Vérifiez les logs Render pour voir s'il y a des erreurs

---

### Problème 3 : CORS bloqué

**Symptôme** : Erreur CORS dans la console

**Solution** :
1. Vérifiez `FRONTEND_URL` dans Render
2. Redéployez le backend après modification
3. Vérifiez que l'URL Vercel est bien dans `FRONTEND_URL`

---

### Problème 4 : Route n'existe pas dans le backend

**Symptôme** : 404 sur une route spécifique

**Solution** :
1. Vérifiez que la route existe dans le backend
2. Testez la route directement : `https://backend.onrender.com/api/route`
3. Vérifiez la documentation des routes API

---

## 📝 Checklist de vérification

Avant de demander de l'aide, vérifiez :

- [ ] ✅ `VITE_API_URL` est configuré dans Vercel
- [ ] ✅ L'URL du backend est correcte (pas de typo)
- [ ] ✅ Le backend Render est démarré et accessible
- [ ] ✅ `FRONTEND_URL` dans Render contient l'URL Vercel
- [ ] ✅ Vous avez redéployé après avoir modifié les variables
- [ ] ✅ La route existe dans le backend (testez directement)
- [ ] ✅ CORS est configuré correctement

---

## 🆘 Si rien ne fonctionne

1. **Vérifiez les logs Vercel** :
   - Vercel Dashboard → Deployments → Cliquez sur un déploiement → Logs
   - Cherchez des erreurs lors du build

2. **Vérifiez les logs Render** :
   - Render Dashboard → Votre service → Logs
   - Cherchez des erreurs ou des requêtes qui arrivent

3. **Testez en local** :
   - Créez un fichier `.env` dans `SkillFusion/Front`
   - Ajoutez `VITE_API_URL=https://votre-backend.onrender.com`
   - Lancez `npm run dev`
   - Testez si ça fonctionne en local

4. **Partagez les informations** :
   - URL Vercel
   - URL Render backend
   - Logs de la console (F12)
   - Message d'erreur exact

---

## 💡 Astuce : Vérification rapide

Ouvrez la console (F12) sur votre site Vercel et tapez :

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Si ça affiche `undefined` → La variable n'est pas configurée dans Vercel.

