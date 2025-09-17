import { Users, Lesson, Role } from "../models/association.js";

const boardController = {
  // Ajoute une leçon aux favoris de l'utilisateur connecté
  async addOneFavorite(req, res) {
    try {
      const lessonId = req.params.id;
      const userId = req.body.user.id; // sécurisé via JWT (middleware d'authentification)

      // Vérifie si la leçon existe
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Leçon non trouvée' });
      }

      // Récupère l'utilisateur
      const user = await Users.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Ajoute la leçon aux favoris (table de liaison)
      await user.addFavorite_lessons(lesson);

      return res.status(200).json({ message: 'Favori ajouté avec succès', lesson });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du favori' });
    }
  },

  // Supprime une leçon des favoris de l'utilisateur connecté
  async removeOneFavorite(req, res) {
    try {
      const lessonId = req.params.id;
      const userId = req.user.id; // utilisateur est authentifié (JWT)

      // Vérifie si la leçon existe
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Leçon non trouvée' });
      }

      // Vérifie si l'utilisateur existe
      const user = await Users.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Supprime la leçon des favoris de l'utilisateur
      await user.removeFavorite_lessons(lesson);

      return res.status(200).json({ message: 'Favori supprimé avec succès' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur lors de la suppression du favori' });
    }
  },

  //Recupère tous les rôles
  async getAllRoles(req, res) {
    
    try {
      const roles = await Role.findAll();
        res.status(200).json(roles);

    } catch (error) {
      console.error('Erreur Sequelize →', error.message);
      res.status(500).json({ error: error.message });
    }
  },
};

export { boardController };