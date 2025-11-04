import argon2 from "argon2";
import jwt from 'jsonwebtoken';
import { User, Role, Lesson, Topic, Reply, Category } from "../models/association.js";
import { userSchema } from "../middlewares/validation.js";

const authentication = {

  // Inscription d'un utilisateur
  async registerUser(req, res) {
    // Récupérer les données du body
    const { user_name, password, email } = req.body;

    // Valider avec Joi, avec abortEarly: false pour récupérer toutes les erreurs
    const { error } = userSchema.validate({ user_name, email, password }, { abortEarly: false });
    if (error) {
      // Transformer les erreurs Joi en objet simple { champ: message }
      const errors = {};
      error.details.forEach(detail => {
        const key = detail.path[0];
        errors[key] = detail.message;
      });
      return res.status(400).json({ errors });
    }

    // La validation du mot de passe est déjà gérée par Joi dans userSchema

    // Vérifier si un utilisateur avec le même email n'existe pas déjà en BDD => faire une requête pour récupérer un utilisateur par son email
    const existing = await User.findOne({ where: { email: email }});
    if (existing) {
      return res.status(409).json({ error: "L'email renseigné est déjà utilisé." });
    }

    // Hacher le mot de passe (pour ne pas le sauvegarder en clair)
    const hash = await argon2.hash(password);

    try {
      // Enregistrer la nouvelle liste en DB
      const result = await User.create({ user_name, password: hash, email, role_id: 3 });

      // Retourner en JSON la nouvelle liste créée, avec toutes ses valeurs (id, title, position, etc.)
      return res.status(201).json(result);
    } catch (error) {
      // On pourrait probablement fouiller un peu la variable error pour avoir un message d'erreur plus clair, mais c'est pas le sujet du cours
      console.error('❌ Erreur Sequelize →', error.message);
      return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },

  // Connexion d'un utilisateur
  async login(req, res) {
    try {
      // Récupérer l'email et le mot de passe fourni depuis req.body
      const { password, email } = req.body;

      // Valider la présence des champs
      if (! password || ! email) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
      }

      // Récupérer en BDD l'utilisateur par son email, si pas d'utilisateur
      const user = await User.findOne({ 
        where: { email : email },
        include: {
          model: Role,
          as: 'role',
          attributes: ['name']  // On veut le nom du rôle
        }
      });
      if (!user) {
        return res.status(401).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
      }

      // Vérifier si le mot de passe est valide, si les mots de passe ne match pas --> 401
      const passwordValid = await argon2.verify(user.password, password);
      if (! passwordValid) {
        return res.status(401).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
      }

      // Générer un token JWT pour l'utilisateur
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN;
      const token = jwt.sign({ 
        id: user.id, 
        email: user.email,
        role_id: user.role_id,
      }, accessTokenSecret, { expiresIn: tokenExpiry }  // Expiration 
      );
      return res.status(200).json({ token, message: "Connexion réussie",});
    } catch (err) {
      console.error('❌ Erreur Sequelize →', err.message);
      return res.status(500).json({ error: err.message });
    }
  },

  async getCurrentUser(req, res) {
    try {
      const id = req.user.id;
 
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Lesson,
            as: 'favorite_lessons',
            attributes: ['id', 'title', 'media_url'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
              }
            ]
          },
          
          {
            model: Topic,
            as: 'topics',
            attributes: ['id', 'title', 'content']
          },
          {
            model: Reply,
            as: 'replies',
            attributes: ['id', 'content']
          }
        ]
      });
 
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
 
      return res.status(200).json(user);
    } catch (err) {
      console.error('❌ Erreur Sequelize →', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
 
  
};

export { authentication };