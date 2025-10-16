// Tests d'intégration avec vraie base de données
import { sequelize } from '../src/models/connection.js';
import { User, Role, Lesson, Category } from '../src/models/association.js';
import argon2 from 'argon2';

// ===== CONFIGURATION DES TESTS D'INTÉGRATION =====

// Configuration de la base de données de test
const testConfig = {
  database: 'skillfusion_test',
  username: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false // Désactiver les logs SQL pendant les tests
};

// ===== FONCTIONS UTILITAIRES =====

async function setupTestDatabase() {
  try {
    // Se connecter à la base de données de test
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données de test réussie');
    
    // Synchroniser les modèles (créer les tables si elles n'existent pas)
    await sequelize.sync({ force: true });
    console.log('✅ Tables de test créées/synchronisées');
    
    // Créer les données de test de base
    await createTestData();
    console.log('✅ Données de test créées');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de la base de données de test:', error);
    throw error;
  }
}

async function createTestData() {
  // Créer les rôles de test
  const adminRole = await Role.create({ name: 'Administrateur' });
  const instructorRole = await Role.create({ name: 'Instructeur' });
  const userRole = await Role.create({ name: 'Utilisateur' });
  
  // Créer une catégorie de test
  const testCategory = await Category.create({ name: 'Test Category' });
  
  // Créer un utilisateur de test
  const hashedPassword = await argon2.hash('TestPassword123!');
  const testUser = await User.create({
    user_name: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    role_id: userRole.id
  });
  
  // Créer un instructeur de test
  const testInstructor = await User.create({
    user_name: 'testinstructor',
    email: 'instructor@example.com',
    password: hashedPassword,
    role_id: instructorRole.id
  });
  
  // Créer un admin de test
  const testAdmin = await User.create({
    user_name: 'testadmin',
    email: 'admin@example.com',
    password: hashedPassword,
    role_id: adminRole.id
  });
  
  return {
    roles: { admin: adminRole, instructor: instructorRole, user: userRole },
    category: testCategory,
    users: { user: testUser, instructor: testInstructor, admin: testAdmin }
  };
}

async function cleanupTestDatabase() {
  try {
    // Fermer la connexion à la base de données
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
  }
}

// ===== LES TESTS D'INTÉGRATION COMMENCENT ICI =====

describe('Tests d\'intégration - Base de données', () => {
  
  // Configuration avant tous les tests
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  // Nettoyage après tous les tests
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  // Nettoyage entre chaque test
  beforeEach(async () => {
    // Nettoyer les données entre les tests si nécessaire
    // (optionnel selon vos besoins)
  });

  describe('Connexion à la base de données', () => {
    
    test('devrait se connecter à la base de données de test', async () => {
      // Arrange & Act
      const isConnected = await sequelize.authenticate();
      
      // Assert
      expect(isConnected).toBeUndefined(); // authenticate() ne retourne rien si succès
    });
  });

  describe('Modèle User - Tests d\'intégration', () => {
    
    test('devrait créer un nouvel utilisateur avec mot de passe haché', async () => {
      // Arrange
      const userData = {
        user_name: 'integrationuser',
        email: 'integration@example.com',
        password: 'IntegrationPassword123!',
        role_id: 3 // Utilisateur
      };
      
      // Act
      const hashedPassword = await argon2.hash(userData.password);
      const newUser = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      // Assert
      expect(newUser).toBeDefined();
      expect(newUser.id).toBeDefined();
      expect(newUser.user_name).toBe(userData.user_name);
      expect(newUser.email).toBe(userData.email);
      expect(newUser.password).not.toBe(userData.password); // Mot de passe haché
      expect(newUser.role_id).toBe(userData.role_id);
      
      // Vérifier que le mot de passe peut être vérifié
      const isPasswordValid = await argon2.verify(newUser.password, userData.password);
      expect(isPasswordValid).toBe(true);
    });

    test('devrait récupérer un utilisateur avec ses relations', async () => {
      // Arrange
      const userId = 1; // Premier utilisateur créé dans setupTestData
      
      // Act
      const user = await User.findByPk(userId, {
        include: ['role']
      });
      
      // Assert
      expect(user).toBeDefined();
      expect(user.role).toBeDefined();
      expect(user.role.name).toBe('Utilisateur');
    });

    test('devrait créer un utilisateur avec un email unique', async () => {
      // Arrange
      const uniqueUserData = {
        user_name: 'uniqueuser',
        email: 'unique@example.com', // Email unique
        password: 'TestPassword123!',
        role_id: 3
      };
      
      // Act
      const newUser = await User.create(uniqueUserData);
      
      // Assert
      expect(newUser).toBeDefined();
      expect(newUser.email).toBe(uniqueUserData.email);
    });
  });

  describe('Modèle Lesson - Tests d\'intégration', () => {
    
    test('devrait créer une leçon avec étapes et matériaux', async () => {
      // Arrange
      const lessonData = {
        title: 'Leçon d\'intégration',
        description: 'Description de la leçon d\'intégration',
        category_id: 1, // Catégorie créée dans setupTestData
        user_id: 2, // Instructeur créé dans setupTestData
        is_published: true
      };
      
      // Act
      const lesson = await Lesson.create(lessonData);
      
      // Créer des étapes pour la leçon
      const step1 = await lesson.createStep({
        step_order: 1,
        title: 'Étape 1',
        description: 'Première étape de la leçon'
      });
      
      const step2 = await lesson.createStep({
        step_order: 2,
        title: 'Étape 2',
        description: 'Deuxième étape de la leçon'
      });
      
      // Créer des matériaux pour la leçon
      const material1 = await lesson.createMaterial({
        name: 'Marteau',
        quantity: 1
      });
      
      const material2 = await lesson.createMaterial({
        name: 'Clous',
        quantity: 10
      });
      
      // Récupérer la leçon avec toutes ses relations
      const lessonWithRelations = await Lesson.findByPk(lesson.id, {
        include: ['category', 'user', 'steps', 'materials']
      });
      
      // Assert
      expect(lessonWithRelations).toBeDefined();
      expect(lessonWithRelations.title).toBe(lessonData.title);
      expect(lessonWithRelations.category).toBeDefined();
      expect(lessonWithRelations.user).toBeDefined();
      expect(lessonWithRelations.steps).toHaveLength(2);
      expect(lessonWithRelations.materials).toHaveLength(2);
      
      // Vérifier l'ordre des étapes
      expect(lessonWithRelations.steps[0].step_order).toBe(1);
      expect(lessonWithRelations.steps[1].step_order).toBe(2);
    });

    test('devrait récupérer toutes les leçons avec filtres', async () => {
      // Arrange
      // Créer une deuxième leçon
      const lesson2 = await Lesson.create({
        title: 'Deuxième leçon',
        description: 'Description de la deuxième leçon',
        category_id: 1,
        user_id: 2,
        is_published: false // Brouillon
      });
      
      // Act
      // Récupérer toutes les leçons publiées
      const publishedLessons = await Lesson.findAll({
        where: { is_published: true },
        include: ['category', 'user']
      });
      
      // Récupérer toutes les leçons d'un utilisateur
      const userLessons = await Lesson.findAll({
        where: { user_id: 2 },
        include: ['category', 'user']
      });
      
      // Assert
      expect(publishedLessons).toHaveLength(1); // Seule la première leçon est publiée
      expect(userLessons).toHaveLength(2); // L'instructeur a 2 leçons
      
      expect(publishedLessons[0].is_published).toBe(true);
      expect(userLessons[0].user.user_name).toBe('testinstructor');
    });
  });

  describe('Relations complexes - Tests d\'intégration', () => {
    
    test('devrait gérer les relations Many-to-Many (favoris)', async () => {
      // Arrange
      const user = await User.findByPk(1); // Utilisateur normal
      const lesson = await Lesson.findByPk(1); // Première leçon
      
      // Act
      // Ajouter la leçon aux favoris de l'utilisateur
      await user.addFavorite_lessons(lesson);
      
      // Récupérer les favoris de l'utilisateur
      const userWithFavorites = await User.findByPk(1, {
        include: ['favorite_lessons']
      });
      
      // Assert
      expect(userWithFavorites.favorite_lessons).toHaveLength(1);
      expect(userWithFavorites.favorite_lessons[0].id).toBe(lesson.id);
    });
  });
});
