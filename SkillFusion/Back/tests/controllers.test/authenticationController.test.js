import { authentication } from "../../src/controllers/authenticationController.js";
import { Users } from "../../src/models/association.js";
import { jest } from '@jest/globals';

// Mock des dépendances
jest.mock("../../src/models/association.js", () => ({
  Users: {
    create: jest.fn()
  }
}));

// Mock des objets Express
const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Authentication Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("devrait créer un nouvel utilisateur avec succès", async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        pseudo: "testUser", 
        email: "test@example.com" 
      };
      Users.create.mockResolvedValue(mockUser);
      
      const req = mockRequest({
        pseudo: "testUser",
        password: "ValidPass123!",
        email: "test@example.com"
      });
      const res = mockResponse();

      // Act
      await authenticationController.registerUser(req, res);

      // Assert
      expect(Users.create).toHaveBeenCalledWith({
        pseudo: "testUser",
        password: "ValidPass123!",
        email: "test@example.com",
        role_id: 3 // Si vous avez une valeur par défaut
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("devrait retourner une erreur 400 si des champs sont manquants", async () => {
      // Arrange
      const req = mockRequest({
        pseudo: "userIncomplet"
      });
      const res = mockResponse();

      // Act
      await authenticationController.registerUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringMatching(/champs obligatoires/i)
      });
    });
  });
});