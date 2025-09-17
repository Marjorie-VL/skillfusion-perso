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

// Routes AUTHENTIFICATION
router.post("/register", authentication.registerUser);
router.post("/login", authentication.login);
router.get("/me", authenticateToken, authentication.getCurrentUser);

// Routes CATALOG
router.get("/lessons", lessonController.getAllLessons);// affiche la liste des cours avec catégorie
router.get("/lesson/:id", lessonController.getOneLesson);// affiche un cours
router.post("/lesson", authenticateToken, isAdminOrInstructor, lessonController.addLesson);// ajoute un cours
router.put("/lesson/:id", authenticateToken, isAdminOrInstructor, lessonController.updateLesson);// modifie un cours
router.delete("/lesson/:id", authenticateToken, isAdminOrInstructor, lessonController.deleteLesson);// supprime un cours 

// Routes CATEGORY
router.get("/categories", categoryController.getAllCategories);// affiche la liste des catégories
router.get("/categories/:id", categoryController.getOneCategory);// affiche une catégorie et ses cours
router.get("/categories/:id/lessons", categoryController.getLessonsByCategory);
router.post("/categories", authenticateToken, isAdminOrInstructor, categoryController.addCategory);// ajoute une catégorie
router.delete("/categories/:id", authenticateToken, isAdminOrInstructor, categoryController.deleteCategory);// supprime une catégorie
router.patch("/categories/:id", authenticateToken, isAdminOrInstructor, categoryController.updateCategory);// modifier une catégorie

// Routes ACCOUNT
router.get("/user",  accountController.getAllUsers);// affiche la liste des utilisateurs,
router.get("/user/:id", authenticateToken, isAdmin,accountController.getOneUser);// affiche le compte d'un utilisateur
router.delete("/user/:id", authenticateToken, isAdmin, accountController.deleteUser);// supprime le compte d'un utilisateur
router.patch("/user/:id", authenticateToken, accountController.updateUser);// modifie un compte
router.post("/lessons/:id/favorite", authenticateToken, boardController.addOneFavorite);// ajoute un favori
router.delete("/lessons/:id/favorite", authenticateToken, boardController.removeOneFavorite);// supprime un favori

// Routes ROLE
// router.patch("/roles/:id", authenticateToken, boardController.updateRole);// modifie un rôle
router.get("/roles", boardController.getAllRoles);// affiche la liste des rôles,


// Route FORUM
router.get("/forum", authenticateToken, forumController.getAllMessages);// affiche la liste des discussions
router.get("/forum/:id", authenticateToken, forumController.getOneMessage);// affiche la liste une discussion
router.post("/forum", authenticateToken, forumController.addMessage);// ajoute une discussion
router.post("/forum/:id/responses", authenticateToken, forumController.addMessageToResponse);// ajoute un message (question/réponse)
router.delete("/forum/:id", authenticateToken, isAdmin,forumController.deleteMessage);// supprimer une discussion
router.delete("/forum/:id/:answer_id", authenticateToken, isAdmin,forumController.deleteResponse);// supprimer une response


