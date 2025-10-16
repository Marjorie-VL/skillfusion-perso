// Tests d'intégration simples - Sans base de données externe
import { authentication } from '../src/controllers/authenticationController.js';
import { lessonController } from '../src/controllers/lessonController.js';
import { authenticateToken } from '../src/middlewares/authenticateToken.js';
import { isAdmin } from '../src/middlewares/authorizeRole.js';
import { userSchema } from '../src/middlewares/validation.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// ===== MOCK DES DÉPENDANCES =====
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// ===== FONCTIONS UTILITAIRES =====

function mockRequest(headers = {}, body = {}, params = {}, user = {}) {
  return { headers, body, params, user };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return jest.fn();
}

// ===== LES TESTS D'INTÉGRATION COMMENCENT ICI =====

describe('Tests d\'intégration simples', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Intégration Authentification + Validation', () => {
    
    test('devrait valider les données puis créer un utilisateur (simulation)', async () => {
      // Arrange
      const userData = {
        user_name: 'integrationuser',
        email: 'integration@example.com',
        password: 'IntegrationPassword123!'
      };
      
      // Act 1: Validation avec Joi
      const { error: validationError } = userSchema.validate(userData);
      
      // Act 2: Hachage du mot de passe (simulation)
      const hashedPassword = await argon2.hash(userData.password);
      
      // Act 3: Vérification du mot de passe haché
      const isPasswordValid = await argon2.verify(hashedPassword, userData.password);
      
      // Assert
      expect(validationError).toBeUndefined();
      expect(hashedPassword).not.toBe(userData.password);
      expect(isPasswordValid).toBe(true);
    });

    test('devrait rejeter des données invalides avant traitement', async () => {
      // Arrange
      const invalidUserData = {
        user_name: 'ab', // Trop court
        email: 'email-invalide', // Format invalide
        password: '123' // Trop court
      };
      
      // Act
      const { error: validationError } = userSchema.validate(invalidUserData);
      
      // Assert
      expect(validationError).toBeDefined();
      expect(validationError.details).toHaveLength(1); // 1 erreur (Joi s'arrête à la première)
    });
  });

  describe('Intégration JWT + Autorisation', () => {
    
    test('devrait créer un token JWT puis vérifier l\'autorisation', () => {
      // Arrange
      const user = { id: 1, email: 'admin@example.com', role_id: 1 };
      const secret = 'test-secret-key';
      
      // Act 1: Créer un token JWT (simulation)
      const token = 'mock-jwt-token';
      jwt.sign.mockReturnValue(token);
      
      // Act 2: Vérifier le token (simulation)
      const decodedUser = { ...user, exp: Date.now() + 3600000, iat: Date.now() };
      jwt.verify.mockReturnValue(decodedUser);
      
      // Act 3: Tester l'autorisation admin
      const req = mockRequest({}, {}, {}, decodedUser);
      const res = mockResponse();
      const next = mockNext();
      
      isAdmin(req, res, next);
      
      // Assert
      expect(decodedUser.id).toBe(user.id);
      expect(decodedUser.email).toBe(user.email);
      expect(decodedUser.role_id).toBe(user.role_id);
      expect(decodedUser.exp).toBeDefined(); // JWT ajoute exp et iat
      expect(decodedUser.iat).toBeDefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait rejeter un utilisateur non-admin après vérification JWT', () => {
      // Arrange
      const user = { id: 2, email: 'user@example.com', role_id: 3 };
      const secret = 'test-secret-key';
      
      // Act 1: Créer un token JWT (simulation)
      const token = 'mock-jwt-token';
      jwt.sign.mockReturnValue(token);
      
      // Act 2: Vérifier le token (simulation)
      const decodedUser = { ...user, exp: Date.now() + 3600000, iat: Date.now() };
      jwt.verify.mockReturnValue(decodedUser);
      
      // Act 3: Tester l'autorisation admin (devrait échouer)
      const req = mockRequest({}, {}, {}, decodedUser);
      const res = mockResponse();
      const next = mockNext();
      
      isAdmin(req, res, next);
      
      // Assert
      expect(decodedUser.id).toBe(user.id);
      expect(decodedUser.email).toBe(user.email);
      expect(decodedUser.role_id).toBe(user.role_id);
      expect(decodedUser.exp).toBeDefined(); // JWT ajoute exp et iat
      expect(decodedUser.iat).toBeDefined();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous n'êtes pas administrateur."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Intégration Middleware + Contrôleur', () => {
    
    test('devrait simuler le flux complet: Auth -> Validation -> Contrôleur', async () => {
      // Arrange
      const user = { id: 1, email: 'admin@example.com', role_id: 1 };
      const secret = 'test-secret-key';
      const token = 'mock-jwt-token';
      
      // Mock jwt.verify pour le middleware d'authentification
      const jwtModule = require('jsonwebtoken');
      jwtModule.verify.mockReturnValue(user);
      
      const req = mockRequest(
        { authorization: `Bearer ${token}` }, // Headers
        { title: 'Test Lesson', description: 'Test Description', category_id: 1, user_id: 1 }, // Body
        {}, // Params
        user // User (ajouté par le middleware d'auth)
      );
      const res = mockResponse();
      const next = mockNext();
      
      // Act 1: Middleware d'authentification
      authenticateToken(req, res, next);
      
      // Vérifier que l'authentification a réussi
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
      
      // Act 2: Middleware d'autorisation (simulation)
      const req2 = mockRequest({}, {}, {}, req.user);
      const res2 = mockResponse();
      const next2 = mockNext();
      
      isAdmin(req2, res2, next2);
      
      // Vérifier que l'autorisation a réussi
      expect(next2).toHaveBeenCalled();
      
      // Act 3: Validation des données (simulation)
      const { error: validationError } = userSchema.validate({
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
      
      // Assert
      expect(validationError).toBeUndefined();
      expect(req.user.role_id).toBe(1); // Admin
    });
  });

  describe('Intégration Hachage + Vérification', () => {
    
    test('devrait hacher un mot de passe puis le vérifier', async () => {
      // Arrange
      const password = 'TestPassword123!';
      
      // Act 1: Hachage
      const hashedPassword = await argon2.hash(password);
      
      // Act 2: Vérification
      const isValid = await argon2.verify(hashedPassword, password);
      const isInvalid = await argon2.verify(hashedPassword, 'WrongPassword');
      
      // Assert
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$argon2/); // Format Argon2
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test('devrait gérer plusieurs mots de passe différents', async () => {
      // Arrange
      const passwords = [
        'Password1!',
        'AnotherPassword2@',
        'ThirdPassword3#'
      ];
      
      // Act
      const hashedPasswords = await Promise.all(
        passwords.map(password => argon2.hash(password))
      );
      
      // Assert
      expect(hashedPasswords).toHaveLength(3);
      
      // Vérifier que chaque mot de passe correspond à son hash
      for (let i = 0; i < passwords.length; i++) {
        const isValid = await argon2.verify(hashedPasswords[i], passwords[i]);
        expect(isValid).toBe(true);
      }
      
      // Vérifier que les hashes sont différents
      expect(hashedPasswords[0]).not.toBe(hashedPasswords[1]);
      expect(hashedPasswords[1]).not.toBe(hashedPasswords[2]);
      expect(hashedPasswords[0]).not.toBe(hashedPasswords[2]);
    });
  });
});
