import { Category, Lesson } from "../models/association.js";
import { lessonSchema, updateLessonSchema } from "../middlewares/validation.js";

const lessonController = {

//Recupère tous les cours avec leur catégorie (filtre optionnel par category_id)
  async getAllLessons(req, res) {
    try {
      const where = {};
      if (req.query?.category_id) {
        where.category_id = req.query.category_id;
      }
      const lessons = await Lesson.findAll({ where, include: ['category'] });
      return res.status(200).json(lessons);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: error.message });
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
      const { title, description, category_id, user_id, materials, steps, media } = req.body;

      // Validation simple
      if (!title || !description || !category_id || !user_id) {
        return res.status(400).json({ error: 'Nom, description, catégorie_id et users_id sont requis.' });
      }

      //  Valider avec Joi
      const { error } = lessonSchema.validate({ title, description, materials, steps }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }

      // Création de la leçon principale
      const lesson = await Lesson.create({
        title,
        description,
        is_published,
        media_url,
        media_alt,
        category_id,
        user_id
      });

      //Ajout des materials s'ils existent
      if (Array.isArray(materials) && materials.length > 0) {
        await Promise.all(materials.map(material =>
          lesson.createMaterial({title : material}) // ou lesson.addMaterial selon tes associations
        ));
      }

    // Ajout des steps s'ils existent
      if (Array.isArray(steps) && steps.length > 0) {
        await Promise.all(steps.map(step =>
        lesson.createStep({
          title: step.title,
          description: step.description,
          media_url: step.media_url
        }) // ou lesson.addStep selon tes associations
      ));
    }

      // Récupérer la leçon complète avec associations pour la réponse
      const lessonWithAssociations = await Lesson.findByPk(lesson.id, {
        include: ['category', 'materials', 'steps'],
      });

      res.status(201).json(lessonWithAssociations);
    } catch(error) {
      console.error('Erreur Sequelize →', error);
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

    const { title, description, category_id, user_id, media_url, materials, steps } = req.body;

    // Mise à jour des champs basiques
    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (category_id !== undefined) lesson.category_id = category_id;
    if (user_id !== undefined) lesson.user_id = user_id;
    if (media_url !== undefined) lesson.media_url = media_url;

    await lesson.save({ transaction: t });

    // Materials
    if (materials !== undefined) {
      await lesson.setMaterials([], { transaction: t });
      if (Array.isArray(materials) && materials.length > 0) {
        await Promise.all(materials.map(m => lesson.createMaterial({ name: m }, { transaction: t })));
      }
    }

    // Steps
    if (steps !== undefined) {
      await lesson.setSteps([], { transaction: t });
      if (Array.isArray(steps) && steps.length > 0) {
        await Promise.all(
          steps.map(s =>
            lesson.createStep({
              title: s.title,
              description: s.description,
              media_url: s.media_url,
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
    console.error("Erreur Sequelize →", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la leçon.", details: error.message });
  }
},

  //Supprime un cours
  async deleteLesson(req, res, next) {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return next();
    }

    await lesson.destroy();

    res.sendStatus(204);
  },
}

export { lessonController };  
