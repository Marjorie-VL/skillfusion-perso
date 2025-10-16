// Test des schémas de validation Joi
import { userSchema, lessonSchema } from '../src/middlewares/validation.js';

// ===== LES TESTS COMMENCENT ICI =====

describe('Validation Schemas', () => {
  
  describe('userSchema - Validation des utilisateurs', () => {
    
    test('devrait valider un utilisateur avec des données correctes', () => {
      // Arrange
      const validUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };

      // Act
      const { error, value } = userSchema.validate(validUser);

      // Assert
      expect(error).toBeUndefined();
      expect(value).toEqual(validUser);
    });

    test('devrait rejeter un nom d\'utilisateur trop court', () => {
      // Arrange
      const invalidUser = {
        user_name: 'ab', // Trop court (minimum 3)
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le nom d\'utilisateur doit contenir au moins 3 caractères.');
    });

    test('devrait rejeter un nom d\'utilisateur trop long', () => {
      // Arrange
      const invalidUser = {
        user_name: 'a'.repeat(31), // Trop long (maximum 30)
        email: 'test@example.com',
        password: 'MotDePasse123!'
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le nom d\'utilisateur ne doit pas dépasser 30 caractères.');
    });

    test('devrait rejeter un email invalide', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'email-invalide', // Email sans @
        password: 'MotDePasse123!'
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('L\'email doit être valide.');
    });

    test('devrait rejeter un mot de passe trop court', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'Mot123!' // Trop court (minimum 12)
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins 12 caractères.');
    });

    test('devrait rejeter un mot de passe sans majuscule', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'motdepasse123!' // Pas de majuscule
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins un majuscule.');
    });

    test('devrait rejeter un mot de passe sans minuscule', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MOTDEPASSE123!' // Pas de minuscule
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins un minuscule.');
    });

    test('devrait rejeter un mot de passe sans chiffre', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MotDePasse!' // Pas de chiffre
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins 12 caractères.');
    });

    test('devrait rejeter un mot de passe sans symbole', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'MotDePasse123' // Pas de symbole
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins un symbole.');
    });

    test('devrait rejeter un mot de passe avec des espaces', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser',
        email: 'test@example.com',
        password: 'Mot De Passe123!' // Avec espaces
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le mot de passe doit contenir au moins un pas d\'espace.');
    });

    test('devrait rejeter un utilisateur avec des champs manquants', () => {
      // Arrange
      const invalidUser = {
        user_name: 'testuser'
        // email et password manquants
      };

      // Act
      const { error } = userSchema.validate(invalidUser);

      // Assert
      expect(error).toBeDefined();
      expect(error.details).toHaveLength(1); // 1 erreur : email manquant (password n'est pas testé car email échoue en premier)
      expect(error.details[0].message).toBe('L\'email est obligatoire.');
    });
  });

  describe('lessonSchema - Validation des leçons', () => {
    
    test('devrait valider une leçon avec des données correctes', () => {
      // Arrange
      const validLesson = {
        title: 'Ma leçon de test',
        description: 'Description de la leçon',
        category_id: 1,
        user_id: 1,
        materials: [
          { name: 'Marteau', quantity: 1 }
        ],
        steps: [
          { title: 'Étape 1', description: 'Première étape' }
        ]
      };

      // Act
      const { error, value } = lessonSchema.validate(validLesson);

      // Assert
      expect(error).toBeUndefined();
      expect(value).toEqual(validLesson);
    });

    test('devrait rejeter une leçon sans titre', () => {
      // Arrange
      const invalidLesson = {
        description: 'Description de la leçon',
        category_id: 1,
        user_id: 1
      };

      // Act
      const { error } = lessonSchema.validate(invalidLesson);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le nom du cours est obligatoire.');
    });

    test('devrait rejeter une leçon avec un titre trop court', () => {
      // Arrange
      const invalidLesson = {
        title: 'Ab', // Trop court (minimum 3)
        description: 'Description de la leçon',
        category_id: 1,
        user_id: 1
      };

      // Act
      const { error } = lessonSchema.validate(invalidLesson);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le nom doit contenir au moins 3 caractères.');
    });

    test('devrait rejeter une leçon sans description', () => {
      // Arrange
      const invalidLesson = {
        title: 'Ma leçon',
        category_id: 1,
        user_id: 1
      };

      // Act
      const { error } = lessonSchema.validate(invalidLesson);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Le contenu du texte est obligatoire.');
    });

    test('devrait rejeter une leçon sans category_id', () => {
      // Arrange
      const invalidLesson = {
        title: 'Ma leçon',
        description: 'Description de la leçon',
        user_id: 1
      };

      // Act
      const { error } = lessonSchema.validate(invalidLesson);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('La catégorie est obligatoire.');
    });

    test('devrait rejeter une leçon sans user_id', () => {
      // Arrange
      const invalidLesson = {
        title: 'Ma leçon',
        description: 'Description de la leçon',
        category_id: 1
      };

      // Act
      const { error } = lessonSchema.validate(invalidLesson);

      // Assert
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('L\'utilisateur est obligatoire.');
    });
  });
});
