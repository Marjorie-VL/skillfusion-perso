// Test du middleware d'authentification
import { authenticateToken } from '../src/middlewares/authenticateToken.js';

// ===== MOCK DES DÉPENDANCES =====

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock de dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// ===== FONCTIONS UTILITAIRES =====

function mockRequest(headers = {}) {
  return { headers };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return jest.fn();
}

// ===== LES TESTS COMMENCENT ICI =====

describe('authenticateToken Middleware', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la variable d'environnement
    process.env.ACCESS_TOKEN_SECRET = 'test-secret-key';
  });

  describe('Token valide', () => {
    
    test('devrait accepter un token JWT valide et appeler next()', () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com', role_id: 2 };
      const validToken = 'valid.jwt.token';
      
      const req = mockRequest({
        authorization: `Bearer ${validToken}`
      });
      const res = mockResponse();
      const next = mockNext();
      
      // Mock jwt.verify pour retourner un utilisateur valide
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue(mockUser);

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret-key');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Token manquant', () => {
    
    test('devrait rejeter une requête sans token', () => {
      // Arrange
      const req = mockRequest(); // Pas de headers authorization
      const res = mockResponse();
      const next = mockNext();

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token d'accès manquant."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait rejeter une requête avec header authorization vide', () => {
      // Arrange
      const req = mockRequest({
        authorization: ''
      });
      const res = mockResponse();
      const next = mockNext();

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token d'accès manquant."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait rejeter une requête avec header authorization sans Bearer', () => {
      // Arrange
      const req = mockRequest({
        authorization: 'InvalidFormat token123'
      });
      const res = mockResponse();
      const next = mockNext();
      
      // Mock jwt.verify pour lancer une erreur générique
      const jwt = require('jsonwebtoken');
      const genericError = new Error('Some other JWT error');
      genericError.name = 'SomeOtherError';
      jwt.verify.mockImplementation(() => {
        throw genericError;
      });

      // Act
      authenticateToken(req, res, next);

      // Assert
      // Le token sera extrait mais sera invalide, donc on aura une erreur 403
      expect(jwt.verify).toHaveBeenCalledWith('token123', 'test-secret-key');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erreur d'authentification."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token expiré', () => {
    
    test('devrait rejeter un token expiré avec le bon message d\'erreur', () => {
      // Arrange
      const expiredToken = 'expired.jwt.token';
      const req = mockRequest({
        authorization: `Bearer ${expiredToken}`
      });
      const res = mockResponse();
      const next = mockNext();
      
      // Mock jwt.verify pour lancer une erreur d'expiration
      const jwt = require('jsonwebtoken');
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token d'accès expiré."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token invalide', () => {
    
    test('devrait rejeter un token invalide avec le bon message d\'erreur', () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';
      const req = mockRequest({
        authorization: `Bearer ${invalidToken}`
      });
      const res = mockResponse();
      const next = mockNext();
      
      // Mock jwt.verify pour lancer une erreur de token invalide
      const jwt = require('jsonwebtoken');
      const invalidError = new Error('Invalid token');
      invalidError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw invalidError;
      });

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token d'accès invalide."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Autres erreurs JWT', () => {
    
    test('devrait gérer les autres erreurs JWT avec un message générique', () => {
      // Arrange
      const badToken = 'bad.jwt.token';
      const req = mockRequest({
        authorization: `Bearer ${badToken}`
      });
      const res = mockResponse();
      const next = mockNext();
      
      // Mock jwt.verify pour lancer une erreur générique
      const jwt = require('jsonwebtoken');
      const genericError = new Error('Some other JWT error');
      genericError.name = 'SomeOtherError';
      jwt.verify.mockImplementation(() => {
        throw genericError;
      });

      // Act
      authenticateToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erreur d'authentification."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
