# GUIDE COMPLET - DÉPLOIEMENT BACKEND SUR RENDER
## SkillFusion - Plateforme d'apprentissage collaboratif

---

## 📋 TABLE DES MATIÈRES

1. [Présentation de Render](#1-présentation-de-render)
2. [Préparation du projet](#2-préparation-du-projet)
3. [Configuration de la base de données](#3-configuration-de-la-base-de-données)
4. [Configuration des variables d'environnement](#4-configuration-des-variables-denvironnement)
5. [Déploiement du service web](#5-déploiement-du-service-web)
6. [Résolution des problèmes](#6-résolution-des-problèmes)
7. [Tests et validation](#7-tests-et-validation)
8. [Bonnes pratiques](#8-bonnes-pratiques)
9. [Récapitulatif des compétences](#9-récapitulatif-des-compétences)

---

## 1. PRÉSENTATION DE RENDER

### 1.1 Qu'est-ce que Render ?

**Render** est une plateforme de déploiement cloud moderne qui simplifie le processus de mise en production d'applications web. Contrairement aux solutions traditionnelles qui nécessitent une configuration complexe de serveurs, Render offre une approche "serverless" où vous déployez simplement votre code et la plateforme s'occupe de tout le reste.

**Fonctionnalités principales :**
- **Déploiement automatique** : Connectez votre repository GitHub et Render déploie automatiquement à chaque push
- **Hébergement de bases de données** : PostgreSQL, Redis, MongoDB intégrés
- **Gestion des variables d'environnement** : Interface sécurisée pour configurer vos secrets
- **Déploiement continu (CI/CD)** : Intégration native avec GitHub pour un workflow de développement fluide
- **Scaling automatique** : Ajustement automatique des ressources selon la charge

**Pourquoi Render plutôt qu'Heroku ou AWS ?**
- **Simplicité** : Configuration en quelques clics vs configuration complexe
- **Prix** : Plan gratuit généreux vs coûts élevés d'AWS
- **Performance** : Infrastructure moderne vs ancienne infrastructure Heroku
- **Support** : Documentation claire et communauté active

### 1.2 Avantages de Render

**Plan gratuit généreux :**
- **Services web** : 750 heures/mois (suffisant pour un projet personnel)
- **Base de données PostgreSQL** : 1GB de stockage gratuit
- **Bande passante** : 100GB/mois
- **Domaine personnalisé** : Support des domaines personnalisés

**Intégration GitHub native :**
- **Déploiement automatique** : Chaque push sur la branche principale déclenche un déploiement
- **Pull Request previews** : Déploiement automatique des branches pour les tests
- **Rollback facile** : Retour à une version précédente en un clic

**Base de données PostgreSQL incluse :**
- **PostgreSQL 15** : Version récente et performante
- **Backups automatiques** : Sauvegardes quotidiennes incluses
- **Monitoring** : Métriques de performance en temps réel
- **SSL natif** : Connexions sécurisées par défaut

**SSL automatique pour les domaines :**
- **Certificats Let's Encrypt** : SSL gratuit et automatique
- **Renouvellement automatique** : Pas de gestion manuelle des certificats
- **HTTPS obligatoire** : Sécurité renforcée par défaut

**Logs en temps réel :**
- **Streaming des logs** : Voir les logs en direct pendant le déploiement
- **Historique des logs** : Conservation des logs pour le debugging
- **Filtrage** : Recherche dans les logs par niveau (error, warn, info)

**Redéploiement facile :**
- **One-click deploy** : Redéploiement en un clic depuis le dashboard
- **Rollback** : Retour à une version précédente instantanément
- **Blue-green deployment** : Déploiement sans interruption de service

---

## 2. PRÉPARATION DU PROJET

### 2.1 Configuration du package.json

**Pourquoi modifier le package.json ?**
Le fichier `package.json` est le cœur de configuration d'un projet Node.js. Pour le déploiement sur Render, nous devons ajouter des scripts spécifiques qui permettront à la plateforme de :
1. **Installer les dépendances** (`npm install`)
2. **Initialiser la base de données** (créer les tables)
3. **Peupler la base de données** (insérer les données de test)
4. **Démarrer l'application** (`npm start`)

**Configuration avant (développement local uniquement) :**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

**Configuration après (prête pour le déploiement) :**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "build": "npm run db:create && npm run db:seed",
    "db:create": "node src/migrations/createTables.js",
    "db:seed:roles": "node src/seeders/seed-roles.js",
    "db:seed:users": "node src/seeders/seed-users.js",
    "db:seed:categories": "node src/seeders/seed-categories.js",
    "db:seed:lessons": "node src/seeders/seed-lessons.js",
    "db:seed:steps": "node src/seeders/seed-steps.js",
    "db:seed:materials": "node src/seeders/seed-materials.js",
    "db:seed:topics": "node src/seeders/seed-topics.js",
    "db:seed:replies": "node src/seeders/seed-replies.js",
    "db:seed:favorites": "node src/seeders/seed-favorites.js",
    "db:seed": "npm run db:seed:roles && npm run db:seed:users && npm run db:seed:categories && npm run db:seed:lessons && npm run db:seed:steps && npm run db:seed:materials && npm run db:seed:topics && npm run db:seed:replies && npm run db:seed:favorites",
    "db:reset": "npm run db:create && npm run db:seed",
    "render-postbuild": "npm run db:create && npm run db:seed"
  }
}
```

**Explication détaillée des scripts :**

- **`build`** : Script principal appelé par Render pendant le build. Il crée les tables puis les peuple avec des données.
- **`db:create`** : Exécute le script de migration qui crée toutes les tables de la base de données.
- **`db:seed:*`** : Scripts individuels pour peupler chaque type de données (rôles, utilisateurs, catégories, etc.).
- **`db:seed`** : Script composite qui exécute tous les scripts de seeding dans le bon ordre.
- **`db:reset`** : Script de réinitialisation complète (utile pour les tests locaux).
- **`render-postbuild`** : Script spécifique à Render (alternative au script `build`).

**Ordre d'exécution critique :**
1. **Rôles** → 2. **Utilisateurs** → 3. **Catégories** → 4. **Leçons** → 5. **Étapes** → 6. **Matériaux** → 7. **Sujets** → 8. **Réponses** → 9. **Favoris**

**Pourquoi cet ordre ?**
- Les **rôles** doivent exister avant les **utilisateurs** (clé étrangère)
- Les **utilisateurs** doivent exister avant les **leçons** (auteur)
- Les **catégories** doivent exister avant les **leçons** (classification)
- Les **leçons** doivent exister avant les **étapes** et **matériaux** (relations)
- Les **sujets** doivent exister avant les **réponses** (relation parent-enfant)

**Compétences acquises :**
- **Configuration des scripts NPM** : Compréhension du système de scripts npm et de leurs dépendances
- **Automatisation de l'initialisation de la base de données** : Création d'un processus automatisé pour la mise en place de l'environnement
- **Gestion des dépendances entre scripts** : Compréhension de l'ordre d'exécution et des relations entre les données
- **Scripts de déploiement** : Création de scripts spécifiques pour les environnements de production

### 2.2 Configuration SSL pour PostgreSQL

**Pourquoi SSL est-il nécessaire ?**
SSL (Secure Sockets Layer) est un protocole de sécurité qui crypte les communications entre votre application et la base de données. Render PostgreSQL **exige** SSL pour toutes les connexions externes pour des raisons de sécurité. Sans SSL, vous obtiendrez l'erreur : `"SSL/TLS required"`.

**Différence entre développement local et production :**
- **Développement local** : PostgreSQL local n'exige généralement pas SSL
- **Production (Render)** : PostgreSQL cloud exige SSL obligatoire
- **Solution** : Configuration conditionnelle basée sur l'environnement

**Problème identifié :** 
L'erreur `"SSL/TLS required"` indique que votre application tente de se connecter à PostgreSQL sans SSL, ce qui est refusé par Render.

**Solution dans `src/models/connection.js` (Sequelize) :**
```javascript
// Configuration SSL pour Sequelize
dialectOptions: {
  ssl: {
    require: true,           // Force l'utilisation de SSL
    rejectUnauthorized: false // Accepte les certificats auto-signés
  },
}
```

**Explication des paramètres SSL :**
- **`require: true`** : Force l'utilisation de SSL pour la connexion
- **`rejectUnauthorized: false`** : Accepte les certificats SSL même s'ils ne sont pas signés par une autorité de certification reconnue (nécessaire pour Render)

**Solution dans `src/config/database.js` (Client pg natif) :**
```javascript
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.PG_URL,
  ssl: {
    require: true,           // Force SSL
    rejectUnauthorized: false // Accepte les certificats auto-signés
  }
});
```

**Pourquoi deux configurations ?**
- **Sequelize** : Utilisé par l'ORM pour les opérations CRUD
- **Client pg** : Utilisé par les scripts de migration et seeding
- **Cohérence** : Les deux doivent avoir la même configuration SSL

**Alternative avec configuration conditionnelle :**
```javascript
// Configuration plus sophistiquée
dialectOptions: {
  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false
  } : false
}
```

**Compétences acquises :**
- **Configuration SSL pour PostgreSQL** : Compréhension des protocoles de sécurité et de leur implémentation
- **Gestion des connexions sécurisées** : Mise en place de connexions cryptées entre l'application et la base de données
- **Résolution des erreurs de connexion** : Diagnostic et correction des problèmes de connectivité SSL
- **Configuration multi-environnement** : Adaptation de la configuration selon l'environnement (dev/prod)

### 2.3 Création des fichiers de configuration

**Pourquoi créer des fichiers de configuration ?**
Les fichiers de configuration permettent de :
1. **Automatiser le déploiement** : Render peut lire ces fichiers pour configurer automatiquement les services
2. **Documenter les variables** : Les autres développeurs comprennent quelles variables sont nécessaires
3. **Reproduire l'environnement** : Faciliter le déploiement sur d'autres environnements
4. **Versionner la configuration** : La configuration fait partie du code source

**Fichier `render.yaml` (Configuration Render Blueprint) :**
```yaml
services:
  # Service Backend API
  - type: web
    name: skillfusion-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: ACCESS_TOKEN_SECRET
        generateValue: true
      - key: ACCESS_TOKEN_EXPIRES_IN
        value: 24h
      - key: PG_URL
        fromDatabase:
          name: skillfusion-db
          property: connectionString
      - key: FRONTEND_URL
        value: https://your-frontend-domain.com

  # Base de données PostgreSQL
  - type: pserv
    name: skillfusion-db
    env: postgresql
    plan: free
    ipAllowList: []
```

**Explication détaillée du render.yaml :**

**Section `services` :**
- **`type: web`** : Définit un service web (vs base de données, worker, etc.)
- **`name`** : Nom unique du service sur Render
- **`env: node`** : Environnement d'exécution (Node.js)
- **`plan: free`** : Plan de tarification (gratuit)

**Section `envVars` :**
- **`generateValue: true`** : Render génère automatiquement une valeur sécurisée
- **`fromDatabase`** : Référence à une base de données créée dans le même fichier
- **`property: connectionString`** : Utilise l'URL de connexion de la base de données

**Section base de données :**
- **`type: pserv`** : Service PostgreSQL
- **`ipAllowList: []`** : Liste vide = accès depuis n'importe où (pour le développement)

**Fichier `env.example` (Documentation des variables) :**
```env
# Configuration de la base de données PostgreSQL
PG_URL=postgresql://username:password@localhost:5432/skillfusion

# Configuration JWT (JSON Web Token)
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRES_IN=24h

# Configuration du serveur
PORT=3000
NODE_ENV=production

# Configuration CORS (pour le frontend)
FRONTEND_URL=https://your-frontend-domain.com
```

**Pourquoi un fichier `env.example` ?**
- **Documentation** : Montre quelles variables sont nécessaires
- **Sécurité** : Ne contient pas de vraies valeurs sensibles
- **Onboarding** : Aide les nouveaux développeurs à configurer leur environnement
- **Template** : Peut être copié vers `.env` et personnalisé

**Convention de nommage :**
- **`.env`** : Fichier réel avec les vraies valeurs (dans .gitignore)
- **`.env.example`** : Template documenté (versionné dans Git)
- **`.env.local`** : Variables spécifiques à l'environnement local
- **`.env.production`** : Variables spécifiques à la production

**Compétences acquises :**
- **Configuration YAML pour le déploiement** : Compréhension du format YAML et de sa structure pour l'infrastructure as code
- **Documentation des variables d'environnement** : Création de templates et documentation pour faciliter la configuration
- **Gestion des environnements multiples** : Séparation claire entre développement, test et production
- **Infrastructure as Code** : Définition de l'infrastructure via des fichiers de configuration versionnés

---

## 3. CONFIGURATION DE LA BASE DE DONNÉES

### 3.1 Création de la base PostgreSQL sur Render

**Étapes suivies :**
1. **Dashboard Render** → **"New +"** → **"PostgreSQL"**
2. **Configuration :**
   - Name: `skillfusion-db`
   - Database: `skillfusion` (ou par défaut)
   - User: `skillfusion_user` (ou par défaut)
   - Region: Europe (Frankfurt)
   - Plan: Free

3. **Récupération des informations :**
   - External Database URL
   - Internal Database URL
   - Credentials

**Compétences acquises :**
- Création de bases de données cloud
- Gestion des credentials de base de données
- Choix de la région pour les performances

### 3.2 URL de connexion

**Format de l'URL :**
```
postgresql://username:password@host:port/database
```

**Exemple générique :**
```
postgresql://skillfusion_user:your-secure-password@dpg-xxxxx.frankfurt-postgres.render.com/skillfusion_db
```

**Composants :**
- **Protocole :** `postgresql://`
- **Utilisateur :** `skillfusion_user` (ou le nom que vous avez choisi)
- **Mot de passe :** `your-secure-password` (généré par Render)
- **Hôte :** `dpg-xxxxx.frankfurt-postgres.render.com` (fourni par Render)
- **Base de données :** `skillfusion_db` (ou le nom que vous avez choisi)

**Compétences acquises :**
- Analyse des URLs de connexion
- Compréhension des composants d'une URL de base de données
- Gestion sécurisée des credentials

---

## 4. CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### 4.1 Variables sur Render Dashboard

**Configuration finale (exemple générique) :**
```
NODE_ENV=production
PORT=3000
ACCESS_TOKEN_SECRET=your-generated-secret-key-here
ACCESS_TOKEN_EXPIRES_IN=24h
PG_URL=postgresql://username:password@host:port/database
FRONTEND_URL=https://your-frontend-domain.com
```

**⚠️ Important :** Remplacez ces valeurs par vos propres credentials obtenus depuis le dashboard Render.

### 4.2 Variables locales (.env)

**Pour le développement local :**
```env
NODE_ENV=development
PORT=3000
PG_URL=postgresql://username:password@localhost:5432/skillfusion
ACCESS_TOKEN_SECRET=your-local-secret-key
ACCESS_TOKEN_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important :** Utilisez vos propres credentials locaux ou ceux de votre base de données Render.

**Compétences acquises :**
- Gestion des environnements (dev/prod)
- Sécurisation des variables sensibles
- Configuration CORS pour le frontend

---

## 5. DÉPLOIEMENT DU SERVICE WEB

### 5.1 Configuration du service

**Étapes suivies :**
1. **Dashboard Render** → **"New +"** → **"Web Service"**
2. **Connexion GitHub :** Repository `skillfusion-perso`
3. **Configuration :**
   - Name: `skillfusion-backend`
   - Environment: Node
   - Region: Europe (même que la DB)
   - Branch: master
   - Root Directory: `SkillFusion/Back`

### 5.2 Commandes de déploiement

**Configuration finale :**
- **Build Command :** `npm install && npm run build`
- **Start Command :** `npm start`

**Processus de déploiement :**
1. **Installation :** `npm install` (dépendances)
2. **Build :** `npm run build` (création tables + seed)
3. **Start :** `npm start` (lancement serveur)

**Compétences acquises :**
- Configuration de services web cloud
- Gestion des commandes de build et start
- Intégration GitHub pour le déploiement continu

---

## 6. RÉSOLUTION DES PROBLÈMES

### 6.1 Erreur "SSL/TLS required"

**Contexte du problème :**
Cette erreur se produit lorsque votre application Node.js tente de se connecter à PostgreSQL Render sans utiliser SSL. Render PostgreSQL exige SSL pour toutes les connexions externes pour des raisons de sécurité.

**Message d'erreur typique :**
```
❌ Erreur Sequelize → "SSL/TLS required"
```

**Cause racine :**
- **Développement local** : PostgreSQL local n'exige généralement pas SSL
- **Production Render** : PostgreSQL cloud exige SSL obligatoire
- **Configuration manquante** : L'application n'est pas configurée pour utiliser SSL

**Solution détaillée :**
1. **Configuration Sequelize** dans `src/models/connection.js`
2. **Configuration Client pg** dans `src/config/database.js`
3. **Paramètres SSL** : `require: true` et `rejectUnauthorized: false`

**Vérification de la solution :**
- Les logs doivent afficher : `✅ Database connection established successfully`
- Plus d'erreur "SSL/TLS required"

### 6.2 Erreur "Missing script: build"

**Contexte du problème :**
Render exécute automatiquement `npm run build` pendant le processus de déploiement, mais ce script n'existait pas dans le package.json original.

**Message d'erreur typique :**
```
npm error Missing script: "build"
npm error
npm error To see a list of scripts, run:
npm error   npm run
```

**Cause racine :**
- **Script manquant** : Le package.json ne contenait pas de script `build`
- **Attente de Render** : Render s'attend à ce que le script `build` existe
- **Processus de déploiement** : Build → Start est le processus standard

**Solution détaillée :**
```json
{
  "scripts": {
    "build": "npm run db:create && npm run db:seed"
  }
}
```

**Pourquoi cette solution ?**
- **Cohérence** : Le script `build` initialise la base de données
- **Automatisation** : Plus besoin de configuration manuelle
- **Reproductibilité** : Même processus à chaque déploiement

### 6.3 Erreur de syntaxe dans Build Command

**Contexte du problème :**
Erreur de frappe dans la configuration Render Dashboard où le séparateur de commandes était incorrect.

**Message d'erreur typique :**
```
==> Running build command 'npm install & npm run build'...
npm error Missing script: "build"
```

**Cause racine :**
- **Séparateur incorrect** : `&` au lieu de `&&`
- **Comportement différent** : `&` exécute en parallèle, `&&` exécute séquentiellement
- **Ordre d'exécution** : `npm run build` s'exécute avant `npm install`

**Solution détaillée :**
- **Incorrect** : `npm install & npm run build`
- **Correct** : `npm install && npm run build`

**Différence entre les séparateurs :**
- **`&`** : Exécution en parallèle (les deux commandes démarrent en même temps)
- **`&&`** : Exécution séquentielle (la deuxième commande attend que la première se termine avec succès)
- **`||`** : Exécution conditionnelle (la deuxième commande s'exécute seulement si la première échoue)

### 6.4 Code non déployé

**Contexte du problème :**
Les modifications locales n'ont pas été commitées et poussées sur GitHub, donc Render utilise encore l'ancienne version du code.

**Symptômes :**
- Les logs montrent l'ancienne version du code
- Les erreurs persistent malgré les corrections
- Le script `build` n'existe toujours pas

**Cause racine :**
- **Git workflow** : Modifications locales non synchronisées avec GitHub
- **Render source** : Render lit le code depuis GitHub, pas depuis votre machine locale
- **Déploiement automatique** : Render ne se déclenche que sur les nouveaux commits

**Solution détaillée :**
```bash
# 1. Ajouter tous les fichiers modifiés
git add .

# 2. Créer un commit avec un message descriptif
git commit -m "Fix: Configuration SSL et build pour déploiement Render"

# 3. Pousser vers GitHub (déclenche le déploiement automatique)
git push origin master
```

**Vérification de la solution :**
- Les logs Render montrent le nouveau commit
- Les modifications sont visibles dans le code déployé
- Les erreurs sont résolues

**Bonnes pratiques Git :**
- **Commits atomiques** : Un commit par fonctionnalité/correction
- **Messages clairs** : Descriptions précises des changements
- **Tests locaux** : Vérifier que tout fonctionne avant de pousser

**Compétences acquises :**
- **Diagnostic des erreurs de déploiement** : Identification rapide des causes racines
- **Résolution des problèmes SSL** : Configuration des connexions sécurisées
- **Gestion des versions Git** : Workflow Git professionnel pour le déploiement
- **Debugging des configurations de build** : Résolution des problèmes de configuration
- **Processus de déploiement** : Compréhension du cycle complet de déploiement

---

## 7. TESTS ET VALIDATION

### 7.1 Endpoints testés

**URL de base (exemple) :** `https://your-app-name.onrender.com`

**Tests effectués :**
- `GET /api/categories` - Liste des catégories
- `GET /api/lessons` - Liste des leçons
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur

### 7.2 Vérification des logs

**Logs attendus :**
```
✅ Database connection established successfully
✅ Database synchronized successfully
🚀 Server started at http://localhost:3000
 API ready to receive requests
🔒 Security: XSS protection enabled
 CORS: Configured for localhost
```

**Compétences acquises :**
- Test d'APIs déployées
- Analyse des logs de déploiement
- Validation des fonctionnalités

---

## 8. BONNES PRATIQUES

### 8.1 Sécurité

- **Variables sensibles** : Jamais dans le code, toujours dans les variables d'environnement
- **SSL** : Toujours activé pour les connexions de production
- **CORS** : Configuration restrictive pour les domaines autorisés

### 8.2 Gestion des environnements

- **Développement** : `NODE_ENV=development`
- **Production** : `NODE_ENV=production`
- **Variables différentes** : URLs, secrets, configurations

### 8.3 Déploiement

- **Tests locaux** : Toujours tester avant le déploiement
- **Commits atomiques** : Un commit par fonctionnalité
- **Messages clairs** : Descriptions précises des changements

**Compétences acquises :**
- Bonnes pratiques de sécurité
- Gestion des environnements
- Processus de déploiement professionnel

---

## 9. RÉCAPITULATIF DES COMPÉTENCES

### 9.1 Compétences techniques acquises

**Déploiement cloud :**
- ✅ Configuration de services web sur Render
- ✅ Gestion de bases de données PostgreSQL cloud
- ✅ Configuration SSL/TLS pour les connexions sécurisées
- ✅ Gestion des variables d'environnement

**DevOps :**
- ✅ Intégration continue avec GitHub
- ✅ Automatisation des déploiements
- ✅ Configuration de scripts de build
- ✅ Monitoring et logs en temps réel

**Résolution de problèmes :**
- ✅ Diagnostic d'erreurs de déploiement
- ✅ Debugging des configurations
- ✅ Gestion des versions Git
- ✅ Tests d'APIs déployées

### 9.2 Compétences métier

**Gestion de projet :**
- ✅ Planification des étapes de déploiement
- ✅ Documentation des processus
- ✅ Gestion des environnements multiples
- ✅ Validation des fonctionnalités

**Sécurité :**
- ✅ Configuration SSL pour PostgreSQL
- ✅ Gestion sécurisée des credentials
- ✅ Variables d'environnement sécurisées
- ✅ Configuration CORS appropriée

### 9.3 Outils maîtrisés

- **Render** : Plateforme de déploiement cloud
- **PostgreSQL** : Base de données relationnelle
- **Git/GitHub** : Gestion de versions et déploiement
- **Node.js/Express** : Serveur web
- **Sequelize** : ORM pour base de données

---

## 🎯 RÉSULTAT FINAL

**API déployée avec succès :** `https://your-app-name.onrender.com`

**Fonctionnalités opérationnelles :**
- ✅ Base de données PostgreSQL initialisée
- ✅ Tables créées automatiquement
- ✅ Données de test insérées
- ✅ API REST accessible
- ✅ Authentification JWT fonctionnelle
- ✅ Upload de fichiers opérationnel
- ✅ Forum et gestion des utilisateurs

---

## 📚 RESSOURCES POUR ALLER PLUS LOIN

### Documentation officielle
- [Render Documentation](https://render.com/docs)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/ssl-tcp.html)
- [Sequelize SSL Options](https://sequelize.org/docs/v6/other-topics/ssl/)

### Outils de test
- [Postman](https://www.postman.com/) - Test d'APIs
- [Thunder Client](https://www.thunderclient.com/) - Extension VS Code
- [Render Logs](https://render.com/docs/logs) - Monitoring

### Bonnes pratiques
- [12-Factor App](https://12factor.net/) - Méthodologie pour applications cloud
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)


