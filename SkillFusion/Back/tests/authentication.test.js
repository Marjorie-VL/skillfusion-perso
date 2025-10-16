// Test du contrôleur d'authentification
import { authentication } from '../src/controllers/authenticationController.js';

// ===== MOCK DES DÉPENDANCES =====
// On "simule" les modules externes pour isoler notre test

// Mock d'argon2 (hachage des mots de passe)
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('mot-de-passe-haché')
}));

// Mock des modèles Sequelize
jest.mock('../src/models/association.js', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn()
  },
  Role: {}
}));

// Mock de Joi (validation)
jest.mock('../src/middlewares/validation.js', () => ({
  userSchema: {
    validate: jest.fn().mockReturnValue({ error: null })
  }
}));

// ===== FONCTIONS UTILITAIRES =====
// Créer des objets Express simulés

function mockRequest(body = {}) {
  return { body };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ===== LES TESTS COMMENCENT ICI =====

describe('Authentication Controller', () => {
  
  // Nettoyer les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
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
      
      // Simuler la création réussie d'un utilisateur
      const { User } = require('../src/models/association.js');
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

      // Act
      await authentication.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tous les champs (user_name, password, email) sont obligatoires.'
      });
    });
  });
});
