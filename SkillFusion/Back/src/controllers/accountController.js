import { Users, Role, Lesson } from "../models/association.js";
import { updateUserSchema } from "../middleware/validation.js";

const accountController = {
  //Récupere les données de tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      const allUsers = await Users.findAll({
        include: [
          {
            model: Role,
            as: 'role',
          }   
        ],
      });
      res.status(200).json({allUsers});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },

  //Récupere les données d'un utilisateur, y compris ses favoris et son rôle
  async getOneUser(req, res) {
    try {
      const id = req.params.id;
      const oneUser = await Users.findByPk(id,{include: [
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
        res.status(400).json({ error: 'Erreur lors de la récupération des données' });
      }
      res.status(200).json({oneUser});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
  },

  //Suppprime le compte d'un utilisateur
  async deleteUser(req, res) {
    try {
      // Vérifie que le compte existe
      const user = await Users.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Compte introuvable" });
      }
    
      // Suppression du compte
      await user.destroy();

      res.status(200).json({ 
        message: "Compte supprimé avec succès",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la suppression du compte"});
    }
  },
 
  //Met à jour les données d'un utilisateur
  async updateUser(req, res) {

    try {
      // Vérifie que le compte existe
      const id = req.params.id;
      const { pseudo, password, mail, role_id } = req.body;

      // Valider avec Joi
      const { error } = updateUserSchema.validate({ pseudo, mail, password }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }

      const user = await Users.findByPk(id);
      if (!user){
        return res.status(409).json({error: "utilisateur introuvable"});
      }
      
      // Vérification des champs
      if (!pseudo || !password || !mail ) {
        return res.status(400).json({ error: "ces champs sont obligatoires" });
      }
     
      // Vérifie que l'e-mail ne soit pas déjà utilisé
      //if (mail && mail !== user.mail) {
        const existingUser = await Users.findOne({ where: { mail } });
        if (existingUser && existingUser.id !== user.id) {
          return res.status(409).json({ error: "Un compte avec ce mail existe déjà" });
        }
      //}

      const updateData = { pseudo, mail, password }; 

      // Vérifie si on essaie de modifier le rôle
      if (role_id !== undefined) {
        // Verifier que l'utlisateur loggé soit bien admin
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
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        error: "Erreur lors de la modification du compte",
      });
    }
  },

  //Met à jour le rôle d'un utilisateur
  async updateRole(req, res) {

    try {
      // Vérifie que le compte existe
      const id = req.params.id;
      const { role_id } = req.body;

      // Valider avec Joi
      const { error } = updateUserSchema.validate({ pseudo }, { abortEarly: false });
      if (error) {
        // Transformer les erreurs Joi en objet simple { champ: message }
        const errors = {};
        error.details.forEach(detail => {
          const key = detail.path[0];
          errors[key] = detail.message;
        });
        return res.status(400).json({ errors });
      }

      const user = await Users.findByPk(id);
      if (!user){
        return res.status(409).json({error: "utilisateur introuvable"});
      }
      
      // Vérification des champs
      if (!role_id ) {
        return res.status(400).json({ error: "ces champs sont obligatoires" });
      }

      const updateData = { role_id }; 

      // Vérifie si on essaie de modifier le rôle
      if (role_id !== undefined) {
        // Verifier que l'utlisateur loggé soit bien admin
        if (req.user.role_id === 1) {
          updateData.role_id = role_id;
        } else {
          return res.status(403).json({ error: "Seul un administrateur peut modifier le rôle d'un utilisateur." });
        }
      }

      // Mise à jour de l'utilisateur
      await user.update(updateData);
            
      return res.status(200).json({ 
        message: "Rôle modifié avec succès",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        error: "Erreur lors de la modification du compte",
      });
    }
  },
};

export { accountController };