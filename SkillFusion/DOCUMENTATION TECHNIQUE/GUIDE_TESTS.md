# 🧪 GUIDE COMPLET DES TESTS - SKILLFUSION
## Plateforme d'apprentissage collaboratif

---

## 📋 TABLE DES MATIÈRES

1. [Introduction aux tests](#1-introduction-aux-tests)
2. [Configuration Jest et environnement](#2-configuration-jest-et-environnement)
3. [Tests unitaires](#3-tests-unitaires)
4. [Tests d'intégration](#4-tests-dintégration)
5. [Tests de middlewares](#5-tests-de-middlewares)
6. [Tests API avec Postman](#6-tests-api-avec-postman)
7. [Tests API avec ThunderClient](#7-tests-api-avec-thunderclient)
8. [Bonnes pratiques et dépannage](#8-bonnes-pratiques-et-dépannage)

---

## 1. INTRODUCTION AUX TESTS

### 1.1 Qu'est-ce qu'un test ?

Un **test** est un code qui vérifie automatiquement que votre application fonctionne correctement. Il simule des situations réelles et vérifie que le résultat obtenu correspond exactement au résultat attendu.

**Pyramide des tests :**
- **Tests unitaires (70%)** : Fonctions isolées, rapides
- **Tests d'intégration (20%)** : Interactions entre composants
- **Tests E2E (10%)** : Application complète

### 1.2 Outils utilisés

- **Jest** : Framework de test JavaScript
- **Babel** : Transpilation ES6+
- **Supertest** : Tests d'APIs HTTP
- **Postman/ThunderClient** : Tests manuels d'API

---

## 2. CONFIGURATION JEST ET ENVIRONNEMENT

### 2.1 Installation

```bash
npm install --save-dev jest babel-jest @babel/core @babel/preset-env supertest
```

### 2.2 Configuration Babel

**`babel.config.cjs` :**
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ]
};
```

### 2.3 Scripts package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathIgnorePatterns=integration",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

### 2.4 Structure des dossiers

```
tests/
├── unit/              # Tests unitaires
│   ├── controllers/
│   ├── middlewares/
│   └── utils/
├── integration/       # Tests d'intégration
│   ├── api/
│   └── database/
├── fixtures/          # Données de test
└── helpers/           # Fonctions utilitaires
```

---

## 3. TESTS UNITAIRES

### 3.1 Structure de base (Pattern AAA)

```javascript
describe('Nom du module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('description du test', () => {
    // ARRANGE - Préparer
    const input = 'données';
    
    // ACT - Exécuter
    const result = functionToTest(input);
    
    // ASSERT - Vérifier
    expect(result).toBe('résultat attendu');
  });
});
```

### 3.2 Tests de contrôleurs avec mocking

```javascript
import { authentication } from '../src/controllers/authenticationController.js';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('mot-de-passe-haché')
}));

jest.mock('../src/models/association.js', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn()
  }
}));

function mockRequest(body = {}) {
  return { body };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Authentication Controller', () => {
  test('devrait créer un utilisateur', async () => {
    const req = mockRequest({
      user_name: 'testuser',
      email: 'test@example.com',
      password: 'MotDePasse123!'
    });
    const res = mockResponse();
    
    const { User } = require('../src/models/association.js');
    User.create.mockResolvedValue({ id: 1, user_name: 'testuser' });
    
    await authentication.registerUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

### 3.3 Tests de validation

```javascript
import { userSchema } from '../src/middlewares/validation.js';

describe('Validation Schemas', () => {
  test('devrait valider un utilisateur valide', () => {
    const validUser = {
      user_name: 'testuser',
      email: 'test@example.com',
      password: 'MotDePasse123!'
    };
    
    const { error } = userSchema.validate(validUser);
    expect(error).toBeUndefined();
  });
  
  test('devrait rejeter un nom trop court', () => {
    const invalidUser = {
      user_name: 'ab',
      email: 'test@example.com',
      password: 'MotDePasse123!'
    };
    
    const { error } = userSchema.validate(invalidUser);
    expect(error).toBeDefined();
  });
});
```

---

## 4. TESTS D'INTÉGRATION

### 4.1 Configuration base de données de test

```javascript
// tests/integration/setup.js
import { sequelize } from '../../src/models/association.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await createTestData();
});

afterAll(async () => {
  await sequelize.close();
});
```

### 4.2 Tests avec base de données réelle

```javascript
import { User, Lesson } from '../../src/models/association.js';
import argon2 from 'argon2';

describe('Tests d\'intégration - Base de données', () => {
  test('devrait créer un utilisateur avec mot de passe haché', async () => {
    const hashedPassword = await argon2.hash('TestPassword123!');
    const user = await User.create({
      user_name: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role_id: 3
    });
    
    expect(user.id).toBeDefined();
    const isValid = await argon2.verify(user.password, 'TestPassword123!');
    expect(isValid).toBe(true);
  });
  
  test('devrait créer une leçon avec relations', async () => {
    const lesson = await Lesson.create({
      title: 'Test Lesson',
      description: 'Description',
      category_id: 1,
      user_id: 1
    });
    
    const step = await lesson.createStep({
      step_order: 1,
      title: 'Étape 1',
      description: 'Description étape'
    });
    
    const lessonWithSteps = await Lesson.findByPk(lesson.id, {
      include: ['steps']
    });
    
    expect(lessonWithSteps.steps).toHaveLength(1);
  });
});
```

### 4.3 Tests d'intégration simples (sans BDD)

```javascript
describe('Intégration Authentification + Validation', () => {
  test('devrait valider puis hacher un mot de passe', async () => {
    const userData = {
      user_name: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!'
    };
    
    const { error } = userSchema.validate(userData);
    expect(error).toBeUndefined();
    
    const hashedPassword = await argon2.hash(userData.password);
    const isValid = await argon2.verify(hashedPassword, userData.password);
    expect(isValid).toBe(true);
  });
});
```

---

## 5. TESTS DE MIDDLEWARES

### 5.1 Tests d'authentification JWT

```javascript
import { authenticateToken } from '../src/middlewares/authenticateToken.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  test('devrait accepter un token valide', () => {
    const req = {
      headers: { authorization: 'Bearer valid.token' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    jwt.verify.mockReturnValue({ id: 1, role_id: 2 });
    
    authenticateToken(req, res, next);
    
    expect(req.user).toEqual({ id: 1, role_id: 2 });
    expect(next).toHaveBeenCalled();
  });
  
  test('devrait rejeter un token manquant', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### 5.2 Tests d'autorisation par rôles

```javascript
import { isAdmin, isSelfOrAdmin } from '../src/middlewares/authorizeRole.js';

describe('Authorization middlewares', () => {
  test('isAdmin devrait autoriser un admin', () => {
    const req = { user: { role_id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    isAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
  
  test('isSelfOrAdmin devrait autoriser modification de son profil', () => {
    const req = {
      user: { id: 5, role_id: 3 },
      params: { id: '5' }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    isSelfOrAdmin(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});
```

---

## 6. TESTS API AVEC POSTMAN

### 6.1 Installation et configuration

1. Téléchargez [Postman](https://www.postman.com)
2. Créez une collection "SkillFusion API Tests"
3. Créez un environnement "Local Development" avec `base_url = http://localhost:3000`

### 6.2 Tests de base

#### Test serveur
```
GET http://localhost:3000/
```

#### Inscription utilisateur
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "user_name": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

#### Connexion (copier le token)
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

**Script de test :**
```javascript
pm.test("Connexion réussie", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json()).to.have.property('token');
    // Copiez le token pour les autres requêtes
});
```

### 6.3 Tests avec authentification

Remplacez `VOTRE_TOKEN_ICI` par le token obtenu :

```
GET http://localhost:3000/api/lessons
Authorization: Bearer VOTRE_TOKEN_ICI
```

### 6.4 Collection complète

Organisez vos requêtes par dossiers :
- 01 - Connectivité
- 02 - Authentification
- 03 - Endpoints protégés
- 04 - Leçons CRUD
- 05 - Catégories
- 06 - Utilisateurs
- 07 - Upload
- 08 - Tests d'erreurs

---

## 7. TESTS API AVEC THUNDERCLIENT

### 7.1 Installation

1. Ouvrez VS Code
2. Extensions → Recherchez "ThunderClient"
3. Installez l'extension

### 7.2 Configuration

1. Créez une collection "SkillFusion API Tests"
2. Créez un environnement avec `baseUrl = http://localhost:3000`

### 7.3 Tests de base

Les requêtes sont identiques à Postman, mais directement dans VS Code :

```
GET {{baseUrl}}/
POST {{baseUrl}}/api/auth/register
POST {{baseUrl}}/api/auth/login
GET {{baseUrl}}/api/lessons
Authorization: Bearer {{token}}
```

### 7.4 Avantages ThunderClient

- ✅ Intégré à VS Code
- ✅ Plus léger que Postman
- ✅ Collections partagées avec le projet
- ✅ Tests rapides pendant le développement

---

## 8. BONNES PRATIQUES ET DÉPANNAGE

### 8.1 Bonnes pratiques

#### Nommage des tests
```javascript
// ✅ BON
test('devrait créer un utilisateur avec des données valides', () => {});

// ❌ MAUVAIS
test('test 1', () => {});
```

#### Nettoyage des mocks
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### Tests indépendants
Chaque test doit être indépendant et ne pas dépendre des autres.

#### Assertions spécifiques
```javascript
// ✅ BON
expect(res.status).toHaveBeenCalledWith(201);
expect(res.json).toHaveBeenCalledWith(expectedData);

// ❌ MAUVAIS
expect(res).toBeDefined();
```

### 8.2 Dépannage

#### Erreur : "Cannot find module"
- Vérifiez que Babel est configuré
- Vérifiez les chemins d'import

#### Erreur : "Database connection failed"
- Vérifiez que PostgreSQL est démarré
- Vérifiez les variables d'environnement

#### Erreur : "Token expired"
- Régénérez un nouveau token
- Vérifiez `ACCESS_TOKEN_EXPIRES_IN` dans `.env`

#### Tests lents
- Utilisez des mocks pour les tests unitaires
- Limitez les tests avec BDD aux tests d'intégration

### 8.3 Commandes utiles

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration
```

---

## 📊 RÉCAPITULATIF

### Tests réalisés dans SkillFusion

- ✅ **Tests unitaires** : Contrôleurs, middlewares, validation
- ✅ **Tests d'intégration** : Base de données, relations, transactions
- ✅ **Tests API** : Postman et ThunderClient pour tests manuels
- ✅ **Couverture** : > 70% du code backend

### Compétences acquises

- Configuration Jest avec Babel
- Pattern Arrange-Act-Assert
- Mocking des dépendances
- Tests avec base de données réelle
- Tests d'API avec outils externes

---

**Ce guide couvre tous les aspects des tests pour SkillFusion !** 🎉

