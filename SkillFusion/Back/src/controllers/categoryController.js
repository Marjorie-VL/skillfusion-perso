import { Category, Lesson, User } from "../models/association.js";
import { categorySchema, updateCategorySchema } from "../middlewares/validation.js";
import { Op } from "sequelize";

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({
        include: [
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['title'],
          where: { is_published: true },
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'user_name']
        }
        ],
      });
      return res.status(200).json(categories);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },

  async getOneCategory(req, res) {
    try {
      const id = req.params.id;
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Lesson,
            as: 'lessons',
            where: { is_published: true },
            required: false
          },    
          ],
      });

      if (!category) {
        return res.status(404).json({ error: 'Catégorie non trouvée' });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },

  async getLessonsByCategory(req, res) {
    const categoryId = req.params.id;
  
    try {
      const category = await Category.findByPk(categoryId, {
        include: [{
          model: Lesson,
          as: 'lessons',
          where: { is_published: true },
          required: false,
          order: [['createdAt', 'DESC']]
        }]
      });
  
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée." });
      }
  
      return res.status(200).json({
        lessons: category.lessons,
        categoryName: category.name,
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },
 
  async addCategory(req, res) {
    try {
      const { name, description } = req.body;
      const user_id = req.user.id; // Récupérer l'ID de l'utilisateur connecté
    
      //  Valider avec Joi
      const { error } = categorySchema.validate({ name, description }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }

      // Vérifie que le nom ne soit pas déjà utilisé
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(409).json({ error: "Une catégorie avec ce nom existe déjà" });
      }
    
      // Puis insertion si OK
      const category = await Category.create({ 
        name, 
        description: description || null,
        user_id 
      });

      return res.status(201).json(category);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },
    
  async updateCategory(req, res) {
    try {
      // Vérifie que la catégorie existe
      const id = req.params.id;
      const { name, description } = req.body;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }

      // Vérifier que l'utilisateur est le propriétaire de la catégorie ou un admin
      // Si user_id est null (catégorie existante), seul l'admin peut modifier
      if (category.user_id && category.user_id !== req.user.id && req.user.role_id !== 1) {
        return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres catégories" });
      }
      if (!category.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: "Seuls les administrateurs peuvent modifier les catégories système" });
      }

      //  Valider avec Joi
      const { error } = updateCategorySchema.validate({ name, description }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }

      // Vérifie que le nom ne soit pas déjà utilisé par une AUTRE catégorie
      const existingCategory = await Category.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: id } // Exclut la catégorie actuelle
        } 
      });
      if (existingCategory) {
        return res.status(409).json({ error: "Une catégorie avec ce nom existe déjà" });
      }

      // Modification de la catégorie
      await category.update({ 
        name,
        description: description || null
      });
            
      return res.status(200).json({ 
        message: "Catégorie modifiée avec succès",
        category: category
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ 
        error: error.message
      });
    }
  },

  async deleteCategory(req, res) {
    try {
      // Vérifie que la catégorie existe
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Catégorie introuvable" });
      }

      // Vérifier que l'utilisateur est le propriétaire de la catégorie ou un admin
      // Si user_id est null (catégorie existante), seul l'admin peut supprimer
      if (category.user_id && category.user_id !== req.user.id && req.user.role_id !== 1) {
        return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres catégories" });
      }
      if (!category.user_id && req.user.role_id !== 1) {
        return res.status(403).json({ error: "Seuls les administrateurs peuvent supprimer les catégories système" });
      }
    
      // Suppression de la catégorie
      await category.destroy();
            
      return res.status(200).json({ 
        message: "Catégorie supprimée avec succès",
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  }
};

export { categoryController };


        