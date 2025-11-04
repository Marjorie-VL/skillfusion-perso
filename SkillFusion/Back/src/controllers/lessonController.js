import { Lesson, User, sequelize } from "../models/association.js";
import { lessonSchema, updateLessonSchema } from "../middlewares/validation.js";

const lessonController = {

//Recupère tous les cours avec leur catégorie (filtre optionnel par category_id)
  async getAllLessons(req, res) {
    try {
      const where = {};
      if (req.query?.category_id) {
        where.category_id = req.query.category_id;
      }
      if (req.query?.user_id) {
        where.user_id = req.query.user_id;
      }
      
      // Par défaut, ne montrer que les cours publiés
      // Sauf si on demande les cours d'un utilisateur spécifique (pour son tableau de bord)
      // ou si on force l'inclusion des brouillons (pour les admins)
      if (!req.query?.user_id && !req.query?.include_drafts) {
        where.is_published = true;
      }
      // Si user_id est spécifié ou include_drafts=true, on retourne tous les cours (publiés + brouillons)
      
      
      const lessons = await Lesson.findAll({ 
        where, 
        include: [
          'category',
          {
            model: User,
            as: 'user',
            attributes: ['id', 'user_name']
          }
        ]
      });
      
      console.log('🔍 getAllLessons - Found lessons:', lessons.length);
      console.log('🔍 getAllLessons - Lessons details:', lessons.map(l => ({ id: l.id, title: l.title, is_published: l.is_published })));
      
      return res.status(200).json(lessons);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },

//Recupère un cours
  async getOneLesson(req, res) {
    try {

      const id = req.params.id
      const lesson = await Lesson.findByPk(id, {
        include: ['category', 'materials', "steps"],
      });

      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      res.status(200).json(lesson);
    } catch (error) {
      console.error('Erreur Sequelize →', error.message);
      res.status(500).json({ error: error.message });
    }
  },

//Ajoute un cours
  async addLesson(req, res) {
    try {
      console.log('🔍 addLesson - Request body:', req.body);
      const { title, description, category_id, user_id, materials, steps, media_url, media_alt, is_published } = req.body;

      // Valider avec Joi
      const { error } = lessonSchema.validate({ title, description, category_id, user_id, media_url, media_alt, materials, steps }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => 
          (errors[detail.path[0]] = detail.message));
        return res.status(400).json({ errors });
      }

      // Création de la leçon
      const lesson = await Lesson.create({
        title,
        description,
        category_id,
        user_id,
        media_url: media_url ?? null,
        media_alt: media_alt ?? null,
        is_published: is_published ?? false, // utilise la valeur envoyée ou false par défaut
      });

      //Ajout des materials
      if (Array.isArray(materials) && materials.length > 0) {
        await Promise.all(materials.map(material =>
          lesson.createMaterial({
            name : material.name,
            quantity: material.quantity ?? 1
          }) 
        ));
      }

    // Ajout des steps
      if (Array.isArray(steps) && steps.length > 0) {
        await Promise.all(steps.map((step, i) =>
        lesson.createStep({
          step_order: i + 1,
          title: step.title,
          description: step.description,
          media_url: step.media_url ?? null,
          media_alt: step.media_alt ?? null,
        })
      ));
    }

      // Retourne la leçon complète
      const lessonWithAssociations = await Lesson.findByPk(lesson.id, {
        include: ['category', 'materials', 'steps', 'user'],
      });

      res.status(201).json(lessonWithAssociations);

    } catch(error) {
      console.error('❌ Erreur Sequelize addLesson →', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ error: 'Erreur lors de la création de la leçon.' });
    }
  },

// Met à jour un cours
async updateLesson(req, res) {
  const t = await sequelize.transaction();
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: ["category", "materials", "steps", "user"],
      transaction: t,
    });

    if (!lesson) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Leçon non trouvée." });
    }

    // Validation Joi (permet mises à jour partielles)
    const { error } = updateLessonSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(d => (errors[d.path[0]] = d.message));
      await t.rollback();
      return res.status(400).json({ success: false, message: "Erreur de validation.", errors });
    }

    const { title, description, category_id, user_id, media_url, media_alt,is_published, materials, steps } = req.body;

    // Mise à jour des champs basiques
    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (category_id !== undefined) lesson.category_id = category_id;
    if (user_id !== undefined) lesson.user_id = user_id;
    if (media_url !== undefined) lesson.media_url = media_url;
    if (media_alt !== undefined) lesson.media_alt = media_alt;
    if (is_published !== undefined) lesson.is_published = is_published;

    await lesson.save({ transaction: t });

    // Mise à jour du matériel si envoyé
    if (materials !== undefined) {
      // Supprimer tous les matériaux existants
      const existingMaterials = await lesson.getMaterials({ transaction: t });
      await Promise.all(existingMaterials.map(material => material.destroy({ transaction: t })));
      
      // Créer les nouveaux matériaux
      if (Array.isArray(materials) && materials.length > 0) {
        await Promise.all(materials.map(material => 
          lesson.createMaterial({ 
            name: material.name,
            quantity: material.quantity ?? 1,
           }, { transaction: t })
          ));
      }
    }

    // Mise à jour des Steps si envoyé
    if (steps !== undefined) {
      // Supprimer toutes les étapes existantes
      const existingSteps = await lesson.getSteps({ transaction: t });
      await Promise.all(existingSteps.map(step => step.destroy({ transaction: t })));
      
      // Créer les nouvelles étapes
      if (Array.isArray(steps) && steps.length > 0) {
        await Promise.all(steps.map((step, i) =>
            lesson.createStep({
              step_order: i + 1,
              title: step.title,
              description: step.description,
              media_url: step.media_url ?? null,
              media_alt: step.media_alt ?? null,
            }, { transaction: t })
          )
        );
      }
    }

    await t.commit();

    const updatedLesson = await Lesson.findByPk(lesson.id, {
      include: ["category", "materials", "steps", "user"],
    });

    res.status(200).json({ success: true, lesson: updatedLesson });

  } catch (error) {
    await t.rollback();
    console.error("❌ Erreur Sequelize →", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la leçon.", details: error.message });
  }
},

  //Supprime un cours
  async deleteLesson(req, res, next) {
    const lesson = await Lesson.findByPk(req.params.id);

    if (!lesson) {
      return res.status(404).json({ error: "Leçon non trouvée." });
    }    

    await lesson.destroy();

    res.sendStatus(204);
  },
}

export { lessonController };  
