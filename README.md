# SkillFusion

SkillFusion est une plateforme web éducative dédiée à l'apprentissage du bricolage et du DIY (Do It Yourself). Elle propose des cours, un forum, un tableau de bord utilisateur, et une gestion des catégories et des leçons. Le projet est structuré en deux parties : un backend (API Node.js/Express/PostgreSQL) et un frontend (React).

---

## Sommaire
1. [Présentation du projet](#présentation-du-projet)
2. [Fonctionnalités principales](#fonctionnalités-principales)
3. [Architecture technique](#architecture-technique)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Structure de la base de données](#structure-de-la-base-de-données)
6. [Utilisation](#utilisation)
7. [Exemples d'utilisation](#exemples-dutilisation)
8. [Tutoriels pas à pas](#tutoriels-pas-à-pas)
9. [Navigation sur la plateforme](#navigation-sur-la-plateforme)
10. [Conseils de sécurité](#conseils-de-sécurité)
11. [Technologies utilisées](#technologies-utilisées)
12. [Auteurs](#auteurs)

---

## Présentation du projet

SkillFusion vise à rendre le bricolage accessible à tous, à distance. Elle s'adresse aussi bien aux amateurs qu'aux professionnels, et propose :
- Des cours détaillés et illustrés
- Un forum communautaire
- Un tableau de bord personnalisé
- Un système de gestion des catégories et des leçons

## Fonctionnalités principales

- **Consultation de cours** (public)
- **Inscription/Connexion** (utilisateur, instructeur, administrateur)
- **Ajout de leçons et de catégories** (instructeur/admin)
- **Tableau de bord utilisateur** (favoris, progression)
- **Forum de discussion** (utilisateurs connectés)
- **Gestion des rôles** (admin)
- **Contact et support**

## Architecture technique

- **Backend** : Node.js, Express, Sequelize, PostgreSQL
- **Frontend** : React, React Router, React Toastify, Vite
- **Authentification** : JWT
- **Sécurité** : Validation (Joi), XSS sanitizer, gestion des rôles

## Installation et démarrage

### Prérequis
- Node.js (>= 18)
- PostgreSQL

### Backend

```bash
cd SkillFusion/Back
npm install
# Configurer le fichier .env (voir exemple ci-dessous)
npm run db:reset
npm run dev
```

Exemple de `.env` :
```
PORT=3000
PG_URL=postgres://skillfusion:mot_de_passe@localhost:5432/skillfusion
ACCESS_TOKEN_SECRET=une_chaine_secrete
ACCESS_TOKEN_EXPIRES_IN=1d
```

### Frontend

```bash
cd SkillFusion/Front
npm install
npm run dev
```

## Structure de la base de données

- **role** : id, description
- **users** : id, pseudo, password, mail, role_id
- **category** : id, name
- **lesson** : id, name, text, media, category_id, users_id
- **step** : id, step_order, title, description, media, lesson_id
- **material** : id, name, lesson_id
- **users_has_favorites** : id, users_id, lesson_id, created_at
- **question** : id, text, users_id
- **response** : id, text, question_id, users_id

## Utilisation

- Accès public : consultation des cours, catégories, contact
- Accès connecté : forum, tableau de bord, ajout de leçons/catégories (selon rôle)
- API RESTful documentée dans le code (`SkillFusion/Back/src/router.js`)

## Exemples d'utilisation

### 1. Visiteur (non connecté)
- Parcourir la liste des cours et des catégories.
- Consulter le détail d’un cours (description, étapes, matériaux).
- Accéder à la page de contact pour poser une question à l’équipe.

### 2. Utilisateur inscrit
- S’inscrire ou se connecter via le formulaire dédié.
- Accéder à son tableau de bord pour retrouver ses cours favoris et suivre sa progression.
- Participer au forum pour poser des questions ou répondre à d’autres membres.
- Modifier ses informations personnelles (pseudo, email, mot de passe).

### 3. Instructeur
- Ajouter un nouveau cours avec description, étapes, images et matériaux nécessaires.
- Créer une nouvelle catégorie de cours.
- Gérer ses propres cours depuis le tableau de bord.

### 4. Administrateur
- Gérer les utilisateurs (changer les rôles, supprimer des comptes).
- Modérer le forum (supprimer des messages ou des réponses).
- Ajouter, modifier ou supprimer des cours et des catégories.

## Tutoriels pas à pas

### Poster une question sur le forum
1. Connectez-vous à votre compte.
2. Cliquez sur « Forum » dans le menu principal.
3. Cliquez sur « Nouvelle discussion » ou « Poster une question ».
4. Remplissez le titre et le texte de votre question.
5. Cliquez sur « Envoyer ».

### Ajouter un cours (instructeur ou admin)
1. Connectez-vous avec un compte instructeur ou administrateur.
2. Cliquez sur « Tableau de bord » puis sur « Créer un nouveau cours ».
3. Remplissez les champs : titre, description, catégorie, étapes, matériaux, images.
4. Cliquez sur « Valider » pour publier le cours.

## Navigation sur la plateforme

- **Menu principal** (en haut de page) : Accès rapide à l’accueil, catalogue, catégories, contact, forum, tableau de bord, connexion/déconnexion.
- **Tableau de bord** : Gère vos favoris, vos cours, vos informations personnelles.
- **Forum** : Liste des discussions, création de sujets, réponses.
- **Catalogue/Catégories** : Parcourez tous les cours ou filtrez par catégorie.
- **Liens importants** : Accueil, Forum, Tableau de bord, Contact (toujours accessibles via le menu).

## Conseils de sécurité

- **Mot de passe** : Utilisez un mot de passe complexe (au moins 12 caractères, une majuscule, une minuscule, un chiffre, un symbole). Ne partagez jamais votre mot de passe.
- **Confidentialité** : Ne communiquez pas d’informations personnelles sensibles sur le forum ou dans les cours.
- **Déconnexion** : Pensez à vous déconnecter après chaque session, surtout sur un ordinateur partagé.
- **Signalement** : En cas de comportement inapproprié ou de problème de sécurité, contactez immédiatement un administrateur via la page Contact ou le forum.

## Technologies utilisées

### Backend
- express
- sequelize
- pg
- dotenv
- cors
- argon2
- joi
- jsonwebtoken
- express-xss-sanitizer
- password-validator

### Frontend
- react
- react-dom
- react-router-dom
- react-toastify
- vite

## Auteurs
Projet réalisé par :  
- Hugo
- Marjorie 
- Rémi
- Séverine
- Teesha

Apprenants de l'Ecole O'Clock - Promo Sushi  
