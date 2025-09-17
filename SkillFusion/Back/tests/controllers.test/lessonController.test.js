import { lessonController } from "../../src/controllers/lessonController.js";
import { Category, Lesson, Material, Step } from "../../src/models/association.js";


jest.mock("../../src/models/association.js", () => ({
  Lesson: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  Category: {
    findByPk: jest.fn()
  },
  Material: {
    create: jest.fn()
  },
  Step: {
    create: jest.fn()
  }
}));

const mockRequest = (params = {}, body = {}, query = {}) => ({ params, body, query });
const mockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  sendStatus: jest.fn()
});

describe('lessonController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLessons', () => {
    it('devrait renvoyer toutes les leçons avec catégorie', async () => {
      const mockLessons = [{ id: 1, name: "Node.js", category: { name: "Dev" } }];
      Lesson.findAll.mockResolvedValue(mockLessons);

      const req = mockRequest();
      const res = mockResponse();

      await lessonController.getAllLessons(req, res);

      expect(Lesson.findAll).toHaveBeenCalledWith({
        include: ['category']
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('addLesson', () => {
    it('devrait créer une nouvelle leçon avec matériaux et étapes', async () => {
      const mockLesson = { 
        id: 1, 
        name: "Docker",
        createMaterial: jest.fn(),
        createStep: jest.fn()
      };
      
      Lesson.create.mockResolvedValue(mockLesson);
      const materials = [{ name: "Cheatsheet" }];
      const steps = [{ description: "Installation" }];

      const req = mockRequest({}, {
        name: "Docker",
        text: "Containers",
        category_id: 1,
        users_id: 1,
        materials,
        steps
      });
      
      const res = mockResponse();

      await lessonController.addLesson(req, res);

      expect(Lesson.create).toHaveBeenCalledWith({
        name: "Docker",
        text: "Containers",
        category_id: 1,
        users_id: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteLesson', () => {
    it('devrait supprimer une leçon existante', async () => {
      const mockLesson = { destroy: jest.fn().mockResolvedValue(true) };
      Lesson.findByPk.mockResolvedValue(mockLesson);

      const req = mockRequest({ id: "1" });
      const res = mockResponse();

      await lessonController.deleteLesson(req, res);

      expect(Lesson.findByPk).toHaveBeenCalledWith("1");
      expect(mockLesson.destroy).toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });
});


