import { Category } from "../models/association.js";
import { Lesson } from "../models/association.js";
import { categorySchema, updateCategorySchema } from "../middleware/validation.js";

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll({
        include: [
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['name'],                              
        },    
        ],
      });
      res.status(200).json({categories});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
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
          },    
          ],
      });

      if (!category) {
        res.status(400).json({ error: 'Erreur lors de la récupération de la catégorie' });
      }
      res.status(200).json({category});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
  },

  async getLessonsByCategory(req, res) {
    const categoryId = req.params.id;
  
    try {
      const category = await Category.findByPk(categoryId, {
        include: [{
          model: Lesson,
          as: 'lessons', // ou le nom que tu as utilisé dans l'association
          order: [['createdAt', 'DESC']]
        }]
      });
  
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée." });
      }
  
      return res.json({
        lessons: category.lessons,
        categoryName: category.name,
      });
    } catch (error) {
      console.error("Erreur →", error.message);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },
 
  async addCategory(req, res) {
    try {
      const { name } = req.body;
    
      // Vérification des champs
      if (!name) {
        return res.status(400).json({ error: "Le champ 'name' est obligatoire !" });
      }

      //  Valider avec Joi
      const { error } = categorySchema.validate({ name }, { abortEarly: false });
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
      const category = await Category.create({ name });

      res.status(201).json(category);
    } catch (error) {
      console.error(error); // Ajoute ça pour voir le vrai problème s'il y en a un
      res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD !" });
    }
  },
    
  async deleteCategory(req, res) {
    try {
      // Vérifie que la catégorie existe
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Catégorie introuvable" });
      }
    
      // Suppression de la catégorie
      await category.destroy();
            
      res.status(200).json({ 
        message: "Catégorie supprimée avec succès",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la suppression de la catégorie"});
    }
  },

  async updateCategory(req, res) {
    try {
      // Vérifie que la catégorie existe
      const id = req.params.id;
      const { name } = req.body;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.sttus(404).json({ error: "Catégorie introuvable" });
      }

      // Vérification des champs
      if (!name) {
        return res.status(400).json({ error: "Le champ 'name' est obligatoire !" });
      }

      //  Valider avec Joi
      const { error } = updateCategorySchema.validate({ name }, { abortEarly: false });
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


      // Modification de la catégorie
      await category.update({ name });
            
      res.status(200).json({ 
        message: "Catégorie modifiée avec succès",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        error: "Erreur lors de la modification de la catégorie",
      });
    }
  }
};

export { categoryController };


        