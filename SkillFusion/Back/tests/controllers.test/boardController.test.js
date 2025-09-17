import { boardController } from "../../src/controllers/boardController.js";
import { Users, Lesson } from "../../src/models/association.js";

jest.mock("../../src/models/association.js", () => ({
  Users: {
    findByPk: jest.fn(),
  },
  Lesson: {
    findByPk: jest.fn()
  }
}));

// Ajouter les méthodes d'association
const mockUserInstance = {
  addFavorite_lessons: jest.fn(),
  removeFavorite_lessons: jest.fn()
};

// Simuler req/res
const mockRequest = (params = {}, body = {}, user = {}) => ({ params, body, user });
const mockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('boardController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Users.findByPk.mockImplementation((id) => {
      return id === 2 ? Promise.resolve(mockUserInstance) : Promise.resolve(null);
    });
  });

  describe('addOneFavorite', () => {
    it('devrait ajouter une leçon aux favoris', async () => {
      // Arrange
      const mockLesson = { id: 1 };
      Lesson.findByPk.mockResolvedValue(mockLesson);

      const req = mockRequest({ id: 1 }, { user: { id: 2 } });
      const res = mockResponse();

      // Act
      await boardController.addOneFavorite(req, res);

      // Assert
      expect(mockUserInstance.addFavorite_lessons).toHaveBeenCalledWith(mockLesson);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});