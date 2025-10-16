// Test du contrôleur de leçons
import { lessonController } from '../src/controllers/lessonController.js';

// ===== MOCK DES DÉPENDANCES =====

// Mock des modèles Sequelize
jest.mock('../src/models/association.js', () => {
  const mockUser = {};
  return {
    Lesson: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    User: mockUser,
    sequelize: {}
  };
});

// Mock de Joi (validation)
jest.mock('../src/middlewares/validation.js', () => ({
  lessonSchema: {
    validate: jest.fn().mockReturnValue({ error: null })
  },
  updateLessonSchema: {
    validate: jest.fn().mockReturnValue({ error: null })
  }
}));

// ===== FONCTIONS UTILITAIRES =====

function mockRequest(params = {}, body = {}, query = {}) {
  return { params, body, query };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
}

// ===== LES TESTS COMMENCENT ICI =====

describe('Lesson Controller', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLessons', () => {
    
    test('devrait retourner toutes les leçons publiées par défaut', async () => {
      // Arrange
      const mockLessons = [
        { 
          id: 1, 
          title: 'Leçon 1', 
          is_published: true,
          category: { name: 'Bricolage' },
          user: { id: 1, user_name: 'instructeur1' }
        }
      ];
      
      const { Lesson } = require('../src/models/association.js');
      Lesson.findAll.mockResolvedValue(mockLessons);
      
      const req = mockRequest();
      const res = mockResponse();

      // Act
      await lessonController.getAllLessons(req, res);

      // Assert
      expect(Lesson.findAll).toHaveBeenCalledWith({
        where: { is_published: true },
        include: [
          'category',
          {
            model: expect.anything(),
            as: 'user',
            attributes: ['id', 'user_name']
          }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockLessons);
    });

    test('devrait filtrer par catégorie si category_id est fourni', async () => {
      // Arrange
      const mockLessons = [
        { id: 1, title: 'Leçon Bricolage', category_id: 1 }
      ];
      
      const { Lesson } = require('../src/models/association.js');
      Lesson.findAll.mockResolvedValue(mockLessons);
      
      const req = mockRequest({}, {}, { category_id: '1' });
      const res = mockResponse();

      // Act
      await lessonController.getAllLessons(req, res);

      // Assert
      expect(Lesson.findAll).toHaveBeenCalledWith({
        where: { 
          category_id: '1',
          is_published: true 
        },
        include: [
          'category',
          {
            model: expect.anything(),
            as: 'user',
            attributes: ['id', 'user_name']
          }
        ]
      });
    });

    test('devrait retourner toutes les leçons (publiées + brouillons) si user_id est fourni', async () => {
      // Arrange
      const mockLessons = [
        { id: 1, title: 'Leçon publiée', is_published: true },
        { id: 2, title: 'Brouillon', is_published: false }
      ];
      
      const { Lesson } = require('../src/models/association.js');
      Lesson.findAll.mockResolvedValue(mockLessons);
      
      const req = mockRequest({}, {}, { user_id: '1' });
      const res = mockResponse();

      // Act
      await lessonController.getAllLessons(req, res);

      // Assert
      expect(Lesson.findAll).toHaveBeenCalledWith({
        where: { user_id: '1' },
        include: [
          'category',
          {
            model: expect.anything(),
            as: 'user',
            attributes: ['id', 'user_name']
          }
        ]
      });
    });
  });

  describe('getOneLesson', () => {
    
    test('devrait retourner une leçon spécifique avec ses détails', async () => {
      // Arrange
      const mockLesson = {
        id: 1,
        title: 'Leçon détaillée',
        description: 'Description complète',
        category: { name: 'Bricolage' },
        materials: [{ name: 'Marteau', quantity: 1 }],
        steps: [{ title: 'Étape 1', description: 'Première étape' }]
      };
      
      const { Lesson } = require('../src/models/association.js');
      Lesson.findByPk.mockResolvedValue(mockLesson);
      
      const req = mockRequest({ id: '1' });
      const res = mockResponse();

      // Act
      await lessonController.getOneLesson(req, res);

      // Assert
      expect(Lesson.findByPk).toHaveBeenCalledWith('1', {
        include: ['category', 'materials', 'steps']
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockLesson);
    });

    test('devrait retourner 404 si la leçon n\'existe pas', async () => {
      // Arrange
      const { Lesson } = require('../src/models/association.js');
      Lesson.findByPk.mockResolvedValue(null);
      
      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      // Act
      await lessonController.getOneLesson(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lesson not found' });
    });
  });
});
