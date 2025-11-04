// Test du contrôleur d'authentification
import { authentication } from '../src/controllers/authenticationController.js';

// ===== MOCK DES DÉPENDANCES =====
// On "simule" les modules externes pour isoler notre test

// Mock d'argon2 (hachage des mots de passe)
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('mot-de-passe-haché'),
  verify: jest.fn().mockResolvedValue(true)
}));

// Mock des modèles Sequelize
jest.mock('../src/models/association.js', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  Role: {},
  Lesson: {},
  Topic: {},
  Reply: {},
  Category: {}
}));

// Mock de Joi (validation)
import { userSchema } from '../src/middlewares/validation.js';
jest.mock('../src/middlewares/validation.js', () => {
  const actualModule = jest.requireActual('../src/middlewares/validation.js');
  return {
    ...actualModule,
    userSchema: {
      validate: jest.fn()
    }
  };
});

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token')
}));

// ===== FONCTIONS UTILITAIRES =====
// Créer des objets Express simulés

function mockRequest(body = {}, user = null) {
  return { body, user };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ===== LES TESTS COMMENCENT ICI =====

describe('Authentication Controller', () => {
  
  // Sauvegarder la fonction console.error originale
  const originalConsoleError = console.error;
  
  // Nettoyer les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    // Mocker console.error pour éviter les logs dans les tests
    console.error = jest.fn();
  });

  // Restaurer console.error après tous les tests
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('registerUser', () => {
    
    test('devrait créer un utilisateur avec des données valides', async () => {
      // Arrange (Préparer)
      const userData = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(userData);
      const res = mockResponse();
      
      // Mock de la validation - succès
      const { userSchema } = require('../src/middlewares/validation.js');
      userSchema.validate.mockReturnValue({ error: null });
      
      // Simuler la création réussie d'un utilisateur
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue(null); // Pas d'utilisateur existant
      User.create.mockResolvedValue({
        id: 1,
        user_name: 'testuser',
        email: 'test@example.com'
      });

      // Act (Agir)
      await authentication.registerUser(req, res);

      // Assert (Vérifier)
      expect(User.create).toHaveBeenCalledWith({
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'mot-de-passe-haché',
        role_id: 3
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('devrait rejeter une inscription avec des champs manquants', async () => {
      // Arrange
      const userDataIncomplete = {
        user_name: 'testuser'
        // email et password manquants
      };
      
      const req = mockRequest(userDataIncomplete);
      const res = mockResponse();

      // Mock de la validation - erreur de validation
      const { userSchema } = require('../src/middlewares/validation.js');
      userSchema.validate.mockReturnValue({
        error: {
          details: [
            { path: ['email'], message: "L'email est obligatoire." },
            { path: ['password'], message: "Le mot de passe est obligatoire." }
          ]
        }
      });

      // Act
      await authentication.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: {
          email: "L'email est obligatoire.",
          password: "Le mot de passe est obligatoire."
        }
      });
    });

    test('devrait rejeter une inscription avec un email déjà utilisé', async () => {
      // Arrange
      const userData = {
        user_name: 'testuser',
        email: 'existing@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(userData);
      const res = mockResponse();
      
      // Mock de la validation - succès
      const { userSchema } = require('../src/middlewares/validation.js');
      userSchema.validate.mockReturnValue({ error: null });
      
      // Simuler un utilisateur existant
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      // Act
      await authentication.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "L'email renseigné est déjà utilisé."
      });
    });

    test('devrait gérer une erreur lors de la création d\'utilisateur', async () => {
      // Arrange
      const userData = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(userData);
      const res = mockResponse();
      
      // Mock de la validation - succès
      const { userSchema } = require('../src/middlewares/validation.js');
      userSchema.validate.mockReturnValue({ error: null });
      
      // Simuler une erreur lors de la création
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Erreur base de données'));

      // Act
      await authentication.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur interne du serveur'
      });
    });
  });

  describe('login', () => {
    
    beforeEach(() => {
      process.env.ACCESS_TOKEN_SECRET = 'test-secret';
      process.env.ACCESS_TOKEN_EXPIRES_IN = '1h';
    });

    test('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(loginData);
      const res = mockResponse();
      
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        role_id: 3,
        role: { name: 'Utilisateur' }
      };
      
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue(mockUser);
      
      const argon2 = require('argon2');
      argon2.verify.mockResolvedValue(true);

      // Act
      await authentication.login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          model: require('../src/models/association.js').Role,
          as: 'role',
          attributes: ['name']
        }
      });
      expect(argon2.verify).toHaveBeenCalledWith('hashed-password', 'MotDePasse123!');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        message: "Connexion réussie"
      });
    });

    test('devrait rejeter une connexion avec des champs manquants', async () => {
      // Arrange
      const req = mockRequest({ email: 'test@example.com' }); // password manquant
      const res = mockResponse();

      // Act
      await authentication.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Tous les champs sont obligatoires."
      });
    });

    test('devrait rejeter une connexion avec un email inexistant', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(loginData);
      const res = mockResponse();
      
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue(null);

      // Act
      await authentication.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "L'email et le mot de passe fournis ne correspondent pas."
      });
    });

    test('devrait rejeter une connexion avec un mot de passe incorrect', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'MauvaisMotDePasse123!'
      };
      
      const req = mockRequest(loginData);
      const res = mockResponse();
      
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        role_id: 3,
        role: { name: 'Utilisateur' }
      };
      
      const { User } = require('../src/models/association.js');
      User.findOne.mockResolvedValue(mockUser);
      
      const argon2 = require('argon2');
      argon2.verify.mockResolvedValue(false);

      // Act
      await authentication.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "L'email et le mot de passe fournis ne correspondent pas."
      });
    });

    test('devrait gérer une erreur lors de la connexion', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };
      
      const req = mockRequest(loginData);
      const res = mockResponse();
      
      const { User } = require('../src/models/association.js');
      User.findOne.mockRejectedValue(new Error('Erreur base de données'));

      // Act
      await authentication.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur base de données'
      });
    });
  });

  describe('getCurrentUser', () => {
    
    test('devrait récupérer l\'utilisateur actuel avec succès', async () => {
      // Arrange
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      
      const mockUser = {
        id: 1,
        user_name: 'testuser',
        email: 'test@example.com',
        role: { id: 3, name: 'Utilisateur' },
        favorite_lessons: [],
        topics: [],
        replies: []
      };
      
      const { User } = require('../src/models/association.js');
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      await authentication.getCurrentUser(req, res);

      // Assert
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] },
        include: expect.arrayContaining([
          expect.objectContaining({
            model: require('../src/models/association.js').Role,
            as: 'role'
          })
        ])
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      // Arrange
      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();
      
      const { User } = require('../src/models/association.js');
      User.findByPk.mockResolvedValue(null);

      // Act
      await authentication.getCurrentUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Utilisateur non trouvé"
      });
    });

    test('devrait gérer une erreur lors de la récupération de l\'utilisateur', async () => {
      // Arrange
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      
      const { User } = require('../src/models/association.js');
      User.findByPk.mockRejectedValue(new Error('Erreur base de données'));

      // Act
      await authentication.getCurrentUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur base de données'
      });
    });
  });
});
