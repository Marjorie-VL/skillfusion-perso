# 🛣️ GUIDE COMPLET DES ROUTES API - SKILLFUSION
## Plateforme d'apprentissage collaboratif

---

## 📋 TABLE DES MATIÈRES

1. [Introduction à l'API SkillFusion](#1-introduction-à-lapi-skillfusion)
2. [Architecture des routes](#2-architecture-des-routes)
3. [Authentification et autorisation](#3-authentification-et-autorisation)
4. [Routes détaillées par module](#4-routes-détaillées-par-module)
5. [Gestion des erreurs](#5-gestion-des-erreurs)
6. [Tests et validation](#6-tests-et-validation)
7. [Bonnes pratiques](#7-bonnes-pratiques)

---

## 1. INTRODUCTION À L'API SKILLFUSION

### 1.1 Qu'est-ce que l'API SkillFusion ?

L'API SkillFusion est une **API REST** complète qui permet de gérer une plateforme d'apprentissage collaboratif dédiée au bricolage et au DIY. Elle expose des endpoints pour :

- **Gestion des utilisateurs** : Inscription, connexion, profils
- **Gestion des leçons** : Création, consultation, favoris
- **Système de forum** : Discussions et réponses
- **Upload de fichiers** : Images et médias
- **Gestion des catégories** : Organisation du contenu

### 1.2 Architecture REST

L'API suit les **principes REST** :
- **Stateless** : Chaque requête contient toutes les informations nécessaires
- **Resource-based** : Les URLs représentent des ressources
- **HTTP Methods** : GET, POST, PATCH, DELETE selon l'action
- **JSON** : Format d'échange de données standard

### 1.3 Base URL et versions

**Développement local :**
```
http://localhost:3000
```

**Production (Render) :**
```
https://skillfusion-perso.onrender.com
```

**Version actuelle :** v1.0

---

## 2. ARCHITECTURE DES ROUTES

### 2.1 Structure des URLs

**Pattern général :**
```
{base_url}/api/{module}/{resource}/{id?}/{action?}
```

**Exemples :**
- `GET /api/lessons` - Liste des leçons
- `GET /api/lessons/1` - Leçon spécifique
- `POST /api/lessons/1/favorite` - Action sur une leçon

### 2.2 Codes de statut HTTP

**Succès :**
- **200 OK** : Requête réussie
- **201 Created** : Ressource créée
- **204 No Content** : Suppression réussie

**Erreurs client :**
- **400 Bad Request** : Données invalides
- **401 Unauthorized** : Token manquant/invalide
- **403 Forbidden** : Permissions insuffisantes
- **404 Not Found** : Ressource introuvable

**Erreurs serveur :**
- **500 Internal Server Error** : Erreur serveur

### 2.3 Authentification JWT

**Token Bearer :*
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Durée de vie :** 24 heures
**Format :** JWT (JSON Web Token)

---

## 3. AUTHENTIFICATION ET AUTORISATION

### 3.1 Système de rôles

**Rôle 1 - Administrateur :**
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs et rôles
- Modération du forum
- Création/modification/suppression de tout contenu

**Rôle 2 - Instructeur :**
- Création et gestion de ses leçons
- Création de catégories
- Participation au forum
- Gestion de son profil

**Rôle 3 - Utilisateur :**
- Consultation des leçons
- Gestion des favoris
- Participation au forum
- Gestion de son profil

### 3.2 Middlewares de sécurité

**authenticateToken :** Vérifie la validité du token JWT
**authorizeRole :** Vérifie les permissions selon le rôle
**isOwnerOrAdmin :** Vérifie la propriété ou le rôle admin

---

## 4. ROUTES DÉTAILLÉES PAR MODULE

### 4.1 🏠 Route racine

**Endpoint de santé de l'API :**
```
GET http://localhost:3000/
```

**Réponse :**
```json
{
  "status": "ok",
  "service": "SkillFusion API",
  "version": "1.0"
}
```

**Utilisation :**
- Vérification de la connectivité
- Monitoring de l'API
- Tests de santé (health checks)

**Codes de réponse :**
- **200** : API opérationnelle
- **500** : Problème serveur

---

### 4.2 🔐 **AUTHENTIFICATION**

#### **4.2.1 Inscription d'un nouvel utilisateur**

**Endpoint :**
```
POST /api/auth/register
```

**Headers requis :**
```
Content-Type: application/json
```

**Body de la requête :**
```json
{
  "user_name": "testuser",
  "email": "test@example.com", 
  "password": "TestPassword123!"
}
```

**Validation des données :**
- **user_name** : 3-50 caractères, unique
- **email** : Format email valide, unique
- **password** : Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole

**Réponse de succès (201) :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "user_name": "testuser",
    "email": "test@example.com",
    "role_id": 3,
    "created_at": "2025-01-16T10:30:00.000Z"
  }
}
```

**Réponses d'erreur :**
- **400** : Données invalides ou utilisateur déjà existant
- **500** : Erreur serveur

**Sécurité :**
- Mot de passe haché avec Argon2
- Validation stricte des données
- Protection XSS

#### **4.2.2 Connexion utilisateur**

**Endpoint :**
```
POST /api/auth/login
```

**Headers requis :**
```
Content-Type: application/json
```

**Body de la requête :**
```json
{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

**Réponse de succès (200) :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "user_name": "testuser",
    "email": "test@example.com",
    "role": {
      "id": 3,
      "name": "user"
    }
  }
}
```

**Réponses d'erreur :**
- **400** : Données manquantes
- **401** : Email ou mot de passe incorrect
- **500** : Erreur serveur

**Sécurité :**
- Vérification du mot de passe avec Argon2
- Génération d'un token JWT sécurisé
- Durée de vie du token : 24 heures

#### **4.2.3 Profil utilisateur**

**Endpoint :**
```
GET /api/account/profile
```

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
```

**Réponse de succès (200) :**
```json
{
  "id": 1,
  "user_name": "testuser",
  "email": "test@example.com",
  "role": {
    "id": 3,
    "name": "user"
  },
  "created_at": "2025-01-16T10:30:00.000Z",
  "updated_at": "2025-01-16T10:30:00.000Z"
}
```

**Réponses d'erreur :**
- **401** : Token manquant ou invalide
- **404** : Utilisateur non trouvé
- **500** : Erreur serveur

**Utilisation :**
- Récupération des informations du profil
- Vérification du rôle utilisateur
- Affichage des données personnelles

---

### 4.3 📚 **GESTION DES LEÇONS**

#### **4.3.1 Récupérer toutes les leçons**

**Endpoint :**
```
GET /api/lessons
```

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
```

**Paramètres de requête optionnels :**
- `category_id` : Filtrer par catégorie
- `user_id` : Filtrer par auteur
- `is_published` : Filtrer par statut de publication
- `limit` : Limiter le nombre de résultats
- `offset` : Pagination

**Exemple avec filtres :**
```
GET /api/lessons?category_id=1&is_published=true&limit=10
```

**Réponse de succès (200) :**
```json
[
  {
    "id": 1,
    "title": "Construire une étagère",
    "description": "Apprenez à construire une étagère en bois",
    "is_published": true,
    "created_at": "2025-01-16T10:30:00.000Z",
    "updated_at": "2025-01-16T10:30:00.000Z",
    "author": {
      "id": 1,
      "user_name": "instructeur1"
    },
    "category": {
      "id": 1,
      "name": "Bricolage"
    },
    "steps": [
      {
        "id": 1,
        "title": "Préparation du matériel",
        "description": "Rassemblez tous les outils nécessaires",
        "order": 1
      }
    ],
    "materials": [
      {
        "id": 1,
        "name": "Planche de bois",
        "quantity": 2
      }
    ]
  }
]
```

**Relations incluses :**
- **Author** : Informations de l'auteur
- **Category** : Catégorie de la leçon
- **Steps** : Étapes ordonnées
- **Materials** : Matériaux nécessaires

#### **4.3.2 Récupérer une leçon spécifique**

**Endpoint :**
```
GET /api/lessons/:id
```

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
```

**Paramètres :**
- `id` : ID de la leçon (obligatoire)

**Réponse de succès (200) :**
```json
{
  "id": 1,
  "title": "Construire une étagère",
  "description": "Apprenez à construire une étagère en bois",
  "is_published": true,
  "created_at": "2025-01-16T10:30:00.000Z",
  "updated_at": "2025-01-16T10:30:00.000Z",
  "author": {
    "id": 1,
    "user_name": "instructeur1",
    "email": "instructeur@example.com"
  },
  "category": {
    "id": 1,
    "name": "Bricolage"
  },
  "steps": [
    {
      "id": 1,
      "title": "Préparation du matériel",
      "description": "Rassemblez tous les outils nécessaires",
      "order": 1,
      "created_at": "2025-01-16T10:30:00.000Z"
    }
  ],
  "materials": [
    {
      "id": 1,
      "name": "Planche de bois",
      "quantity": 2,
      "created_at": "2025-01-16T10:30:00.000Z"
    }
  ]
}
```

**Réponses d'erreur :**
- **401** : Token manquant ou invalide
- **404** : Leçon non trouvée
- **500** : Erreur serveur

#### **4.3.3 Créer une nouvelle leçon**

**Endpoint :**
```
POST /api/lessons
```

**Permissions requises :** Admin ou Instructeur

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body de la requête :**
```json
{
  "title": "Ma leçon",
  "description": "Description détaillée de la leçon",
  "category_id": 1,
  "materials": [
    {
      "name": "Marteau",
      "quantity": 1
    },
    {
      "name": "Clous",
      "quantity": 20
    }
  ],
  "steps": [
    {
      "title": "Étape 1",
      "description": "Description de la première étape",
      "order": 1
    },
    {
      "title": "Étape 2", 
      "description": "Description de la deuxième étape",
      "order": 2
    }
  ]
}
```

**Validation des données :**
- **title** : 3-100 caractères, obligatoire
- **description** : 10-1000 caractères, obligatoire
- **category_id** : ID de catégorie existant, obligatoire
- **materials** : Array d'objets avec name et quantity
- **steps** : Array d'objets avec title, description et order

**Réponse de succès (201) :**
```json
{
  "message": "Leçon créée avec succès",
  "lesson": {
    "id": 2,
    "title": "Ma leçon",
    "description": "Description détaillée de la leçon",
    "is_published": false,
    "category_id": 1,
    "user_id": 1,
    "created_at": "2025-01-16T10:30:00.000Z",
    "updated_at": "2025-01-16T10:30:00.000Z"
  }
}
```

**Réponses d'erreur :**
- **400** : Données invalides
- **401** : Token manquant ou invalide
- **403** : Permissions insuffisantes
- **500** : Erreur serveur

#### **4.3.4 Modifier une leçon**

**Endpoint :**
```
PATCH /api/lessons/:id
```

**Permissions requises :** Propriétaire de la leçon, Admin ou Instructeur

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body de la requête (champs optionnels) :**
```json
{
  "title": "Titre modifié",
  "description": "Description modifiée",
  "is_published": true,
  "category_id": 2
}
```

**Réponse de succès (200) :**
```json
{
  "message": "Leçon modifiée avec succès",
  "lesson": {
    "id": 1,
    "title": "Titre modifié",
    "description": "Description modifiée",
    "is_published": true,
    "updated_at": "2025-01-16T11:00:00.000Z"
  }
}
```

#### **4.3.5 Supprimer une leçon**

**Endpoint :**
```
DELETE /api/lessons/:id
```

**Permissions requises :** Propriétaire de la leçon ou Admin

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
```

**Réponse de succès (204) :**
```
No Content
```

**Réponses d'erreur :**
- **401** : Token manquant ou invalide
- **403** : Permissions insuffisantes
- **404** : Leçon non trouvée
- **500** : Erreur serveur

#### **4.3.6 Gestion des favoris**

**Ajouter aux favoris :**
```
POST /api/lessons/:id/favorite
```

**Retirer des favoris :**
```
DELETE /api/lessons/:id/favorite
```

**Headers requis :**
```
Authorization: Bearer YOUR_TOKEN
```

**Réponse de succès (200) :**
```json
{
  "message": "Leçon ajoutée aux favoris"
}
```

**Utilisation :**
- Permet aux utilisateurs de sauvegarder leurs leçons préférées
- Accès rapide depuis le tableau de bord
- Système de recommandations

---

## 📂 **CATÉGORIES**

### **Récupérer toutes les catégories**
```
GET http://localhost:3000/categories
Authorization: Bearer YOUR_TOKEN
```

### **Récupérer une catégorie**
```
GET http://localhost:3000/categories/:id
Authorization: Bearer YOUR_TOKEN
```

### **Récupérer les leçons d'une catégorie**
```
GET http://localhost:3000/categories/:id/lessons
Authorization: Bearer YOUR_TOKEN
```

### **Créer une catégorie** (Admin/Instructeur)
```
POST http://localhost:3000/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "name": "Nouvelle catégorie"
}
```

### **Modifier une catégorie** (Admin/Instructeur)
```
PATCH http://localhost:3000/categories/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "name": "Nom modifié"
}
```

### **Supprimer une catégorie** (Admin/Instructeur)
```
DELETE http://localhost:3000/categories/:id
Authorization: Bearer YOUR_TOKEN
```

---

## 👤 **UTILISATEURS**

### **Récupérer tous les utilisateurs** (Admin)
```
GET http://localhost:3000/users
Authorization: Bearer ADMIN_TOKEN
```

### **Récupérer un utilisateur** (Admin)
```
GET http://localhost:3000/users/:id
Authorization: Bearer ADMIN_TOKEN
```

### **Récupérer les favoris d'un utilisateur**
```
GET http://localhost:3000/users/:id/favorites
Authorization: Bearer YOUR_TOKEN
```

### **Modifier un utilisateur** (Soi-même ou Admin)
```
PATCH http://localhost:3000/users/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "user_name": "nouveau_nom"
}
```

### **Supprimer un utilisateur** (Soi-même ou Admin)
```
DELETE http://localhost:3000/users/:id
Authorization: Bearer YOUR_TOKEN
```

### **Modifier le rôle** (Admin)
```
PATCH http://localhost:3000/users/:id/role
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
Body: {
  "role_id": 2
}
```

---

## 🎭 **RÔLES**

### **Récupérer tous les rôles**
```
GET http://localhost:3000/roles
Authorization: Bearer YOUR_TOKEN
```

---

## 💬 **FORUM**

### **Récupérer tous les sujets**
```
GET http://localhost:3000/forum
Authorization: Bearer YOUR_TOKEN
```

### **Créer un sujet**
```
POST http://localhost:3000/forum
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "title": "Mon sujet",
  "content": "Contenu du sujet"
}
```

### **Récupérer un sujet et ses réponses**
```
GET http://localhost:3000/forum/:topicId
Authorization: Bearer YOUR_TOKEN
```

### **Modifier un sujet** (Propriétaire ou Admin)
```
PATCH http://localhost:3000/forum/:topicId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "title": "Titre modifié"
}
```

### **Supprimer un sujet** (Propriétaire ou Admin)
```
DELETE http://localhost:3000/forum/:topicId
Authorization: Bearer YOUR_TOKEN
```

### **Ajouter une réponse**
```
POST http://localhost:3000/forum/:topicId/reply
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "content": "Ma réponse"
}
```

### **Modifier une réponse** (Propriétaire ou Admin)
```
PATCH http://localhost:3000/forum/:topicId/reply/:replyId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
Body: {
  "content": "Réponse modifiée"
}
```

### **Supprimer une réponse** (Propriétaire ou Admin)
```
DELETE http://localhost:3000/forum/:topicId/reply/:replyId
Authorization: Bearer YOUR_TOKEN
```

---

## 📁 **UPLOAD**

### **Upload d'un fichier**
```
POST http://localhost:3000/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
Body: file (sélectionner un fichier)
```

---

## 🎯 **TESTS RAPIDES AVEC POWERSHELL**

### **1. Test de connectivité**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/"
```

### **2. Connexion**
```powershell
$login = Invoke-RestMethod -Uri "http://localhost:3000/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"TestPassword123!"}'
$token = $login.token
```

### **3. Récupérer les leçons**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/lessons" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### **4. Récupérer les catégories**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

---

## 🔑 **RÔLES ET PERMISSIONS**

### **Rôle 1 : Administrateur**
- Accès à tout
- Peut créer/modifier/supprimer catégories
- Peut créer/modifier/supprimer leçons
- Peut gérer les utilisateurs et rôles

### **Rôle 2 : Instructeur**
- Peut créer/modifier/supprimer ses leçons
- Peut créer/modifier/supprimer catégories
- Peut participer au forum

### **Rôle 3 : Utilisateur**
- Peut consulter les leçons
- Peut ajouter/retirer des favoris
- Peut participer au forum
- Peut modifier son profil


