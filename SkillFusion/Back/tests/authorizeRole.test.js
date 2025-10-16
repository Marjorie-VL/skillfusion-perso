// Test des middlewares d'autorisation
import { 
  isAdmin, 
  isInstructor, 
  isAdminOrInstructor, 
  isSelfOrAdmin, 
  isOwnerOrAdmin 
} from '../src/middlewares/authorizeRole.js';

// ===== FONCTIONS UTILITAIRES =====

function mockRequest(user = {}, params = {}) {
  return { user, params };
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

describe('Authorization Middlewares', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin', () => {
    
    test('devrait autoriser un administrateur (role_id = 1)', () => {
      // Arrange
      const adminUser = { id: 1, role_id: 1, email: 'admin@example.com' };
      const req = mockRequest(adminUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait refuser un instructeur (role_id = 2)', () => {
      // Arrange
      const instructorUser = { id: 2, role_id: 2, email: 'instructor@example.com' };
      const req = mockRequest(instructorUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous n'êtes pas administrateur."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait refuser un utilisateur normal (role_id = 3)', () => {
      // Arrange
      const normalUser = { id: 3, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(normalUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous n'êtes pas administrateur."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isInstructor', () => {
    
    test('devrait autoriser un instructeur (role_id = 2)', () => {
      // Arrange
      const instructorUser = { id: 2, role_id: 2, email: 'instructor@example.com' };
      const req = mockRequest(instructorUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isInstructor(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait refuser un administrateur (role_id = 1)', () => {
      // Arrange
      const adminUser = { id: 1, role_id: 1, email: 'admin@example.com' };
      const req = mockRequest(adminUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isInstructor(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous devez être instructeur."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdminOrInstructor', () => {
    
    test('devrait autoriser un administrateur (role_id = 1)', () => {
      // Arrange
      const adminUser = { id: 1, role_id: 1, email: 'admin@example.com' };
      const req = mockRequest(adminUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdminOrInstructor(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait autoriser un instructeur (role_id = 2)', () => {
      // Arrange
      const instructorUser = { id: 2, role_id: 2, email: 'instructor@example.com' };
      const req = mockRequest(instructorUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdminOrInstructor(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait refuser un utilisateur normal (role_id = 3)', () => {
      // Arrange
      const normalUser = { id: 3, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(normalUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isAdminOrInstructor(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous devez être administrateur ou instructeur."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isSelfOrAdmin', () => {
    
    test('devrait autoriser un utilisateur modifiant son propre profil', () => {
      // Arrange
      const user = { id: 5, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(user, { id: '5' });
      const res = mockResponse();
      const next = mockNext();

      // Act
      isSelfOrAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait autoriser un admin modifiant n\'importe quel profil', () => {
      // Arrange
      const adminUser = { id: 1, role_id: 1, email: 'admin@example.com' };
      const req = mockRequest(adminUser, { id: '999' }); // Admin modifie le profil 999
      const res = mockResponse();
      const next = mockNext();

      // Act
      isSelfOrAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait refuser un utilisateur modifiant le profil d\'un autre', () => {
      // Arrange
      const user = { id: 5, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(user, { id: '10' }); // Utilisateur 5 essaie de modifier le profil 10
      const res = mockResponse();
      const next = mockNext();

      // Act
      isSelfOrAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès interdit. Vous ne pouvez modifier que votre propre profil."
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('devrait refuser avec un ID utilisateur invalide', () => {
      // Arrange
      const user = { id: 5, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(user, { id: 'invalid' });
      const res = mockResponse();
      const next = mockNext();

      // Act
      isSelfOrAdmin(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Identifiant utilisateur invalide."
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isOwnerOrAdmin', () => {
    
    test('devrait autoriser un administrateur', () => {
      // Arrange
      const adminUser = { id: 1, role_id: 1, email: 'admin@example.com' };
      const req = mockRequest(adminUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isOwnerOrAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait laisser passer un instructeur (vérification de propriété dans le contrôleur)', () => {
      // Arrange
      const instructorUser = { id: 2, role_id: 2, email: 'instructor@example.com' };
      const req = mockRequest(instructorUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isOwnerOrAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('devrait laisser passer un utilisateur normal (vérification de propriété dans le contrôleur)', () => {
      // Arrange
      const normalUser = { id: 3, role_id: 3, email: 'user@example.com' };
      const req = mockRequest(normalUser);
      const res = mockResponse();
      const next = mockNext();

      // Act
      isOwnerOrAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
