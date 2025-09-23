import { Router } from 'express';
import { lessonController } from "./controllers/lessonController.js";
import { categoryController } from "../src/controllers/categoryController.js";
import { forumController } from "../src/controllers/forumController.js";
import { accountController } from "../src/controllers/accountController.js";
import { authentication } from "../src/controllers/authenticationController.js";
import { boardController } from "../src/controllers/boardController.js";
import { authenticateToken } from './middleware/authenticateToken.js';
import { isAdmin } from './middleware/authorizeRole.js';
import { isAdminOrInstructor } from './middleware/authorizeRole.js';

export const router = Router();

// Health/root
router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'SkillFusion API', version: '1.0' });
});

// Routes AUTHENTIFICATION
router.post("/register", authentication.registerUser);
router.post("/login", authentication.login);
router.get("/me", authenticateToken, authentication.getCurrentUser);

// Routes CATALOGUES
router.get("/lessons", lessonController.getAllLessons); // affiche la liste des cours avec catégorie
router.get("/lessons/:id", lessonController.getOneLesson); // affiche un cours
router.post("/lessons", authenticateToken, isAdminOrInstructor, lessonController.addLesson); // ajoute un cours
router.patch("/lessons/:id", authenticateToken, isAdminOrInstructor, lessonController.updateLesson); // modifie un cours
router.delete("/lessons/:id", authenticateToken, isAdminOrInstructor, lessonController.deleteLesson); // supprime un cours 
router.post("/lessons/:id/favorite", authenticateToken, boardController.addOneFavorite);// ajoute un favori
router.delete("/lessons/:id/favorite", authenticateToken, boardController.removeOneFavorite);// supprime un favori


// Routes CATEGORY
router.get("/categories", categoryController.getAllCategories); // affiche la liste des catégories
router.get("/categories/:id", categoryController.getOneCategory); // affiche une catégorie
router.get("/categories/:id/lessons", categoryController.getLessonsByCategory); // affiche une catégorie et ses cours
router.post("/categories", authenticateToken, isAdminOrInstructor, categoryController.addCategory);// ajoute une catégorie
router.patch("/categories/:id", authenticateToken, isAdminOrInstructor, categoryController.updateCategory);// modifier une catégorie
router.delete("/categories/:id", authenticateToken, isAdminOrInstructor, categoryController.deleteCategory);// supprime une catégorie


// Routes ACCOUNT
router.get("/users",  accountController.getAllUser);// affiche la liste des utilisateurs avec leur rôle
router.get("/users/:id", authenticateToken, isAdmin,accountController.getOneUser);// affiche le compte d'un utilisateur
// router.get("/users/:id/favorites", authenticateToken, accountController.getAllFavorites); // affiche la liste des leçons favorites d'un utilisateur
router.patch("/users/:id", authenticateToken, accountController.updateUser);// modifie un compte
router.delete("/users/:id", authenticateToken, isAdmin, accountController.deleteUser);// supprime le compte d'un utilisateur



// Routes ROLE
router.get("/roles", boardController.getAllRoles);// affiche la liste des rôles
//router.patch("/roles/:id", authenticateToken, boardController.updateRole);// modifie un rôle


// Route FORUM
router.get("/forum", authenticateToken, forumController.getAllTopics);// affiche la liste des sujets
router.post("/forum", authenticateToken, forumController.addTopic);// ajoute un sujet
router.delete("/forum/:topicId", authenticateToken, isAdmin,forumController.deleteDiscussion);// supprimer un sujet et ses réponses
router.get("/forum/:topicId", authenticateToken, forumController.getOneDiscussion);// Affiche un sujet et ses réponses
router.post("/forum/:topicId/reply", authenticateToken, forumController.addReply);// ajoute une réponse à un sujet
/*TODO Rajouter la route PATCH*/
// router.patch("/forum/:topicId/reply/:replyId", authenticateToken, forumController.updateReply);// modifier une réponse 
router.delete("/forum/:topicId/reply/:replyId", authenticateToken, isAdmin,forumController.deleteReply);// supprimer une réponse 


