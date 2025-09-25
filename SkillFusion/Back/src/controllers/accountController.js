import { User, Role, Lesson } from "../models/association.js";
import { updateUserSchema } from "../middlewares/validation.js";

const accountController = {
  //Récupere les données de tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Role,
            as: 'role',
          }   
        ],
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  //Récupere les données d'un utilisateur, y compris ses favoris et son rôle
  async getOneUser(req, res) {
    try {
      const id = req.params.id;
      const oneUser = await User.findByPk(id,{include: [
        {
          model: Role,
          as: 'role',
        },
        {
          model: Lesson,
          as: 'favorite_lessons',
        }
      ]});
      if (!oneUser) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      return res.status(200).json(oneUser);
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  //Suppprime le compte d'un utilisateur
  async deleteUser(req, res) {
    try {
      // Vérifie que le compte existe
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Compte introuvable" });
      }
    
      // Suppression du compte
      await user.destroy();

      return res.status(200).json({ 
        message: "Compte supprimé avec succès",
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: error.message });
    }
  },
 
  //Met à jour les données d'un utilisateur
  async updateUser(req, res) {
    try {
      // Vérifie que le compte existe
      const id = req.params.id;
      const { user_name, password, email, role_id } = req.body;

      const user = await User.findByPk(id);
      if (!user){
        return res.status(404).json({error: "Utilisateur introuvable"});
      }

      // Valider avec Joi
      const { error } = updateUserSchema.validate({ user_name, email, password }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }
     
      // Vérifie que l'e-mail ne soit pas déjà utilisé par un autre utilisateur
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== user.id) {
          return res.status(409).json({ error: "Un compte avec cet email existe déjà" });
        }
      }

      const updateData = { user_name, email, password }; 

      // Vérifie si on essaie de modifier le rôle
      if (role_id !== undefined) {
        // Verifier que l'utilisateur loggé soit bien admin
        if (req.user.role_id === 1) {
          updateData.role_id = role_id;
        } else {
          return res.status(403).json({ error: "Seul un administrateur peut modifier le rôle d'un utilisateur." });
        }
      }

      // Mise à jour de l'utilisateur
      await user.update(updateData);
            
      return res.status(200).json({ 
        message: "Compte modifié avec succès",
        user: user
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ 
        error: error.message
      });
    }
  },

  //Met à jour le rôle d'un utilisateur
  async updateRole(req, res) {
    try {
      // Vérifie que le compte existe
      const id = req.params.id;
      const { role_id } = req.body;

      const user = await User.findByPk(id);
      if (!user){
        return res.status(404).json({error: "Utilisateur introuvable"});
      }
      
      // Vérification des champs
      if (!role_id) {
        return res.status(400).json({ error: "Le rôle est obligatoire" });
      }

      // Vérifier que l'utilisateur loggé soit bien admin
      if (req.user.role_id !== 1) {
        return res.status(403).json({ error: "Seul un administrateur peut modifier le rôle d'un utilisateur." });
      }

      // Mise à jour du rôle
      await user.update({ role_id });
            
      return res.status(200).json({ 
        message: "Rôle modifié avec succès",
        user: user
      });
    } catch (error) {
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ 
        error: error.message
      });
    }
  },
};

export { accountController };