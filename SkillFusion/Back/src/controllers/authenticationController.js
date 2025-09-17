import PasswordValidator from "password-validator";
import argon2 from "argon2";
import jwt from 'jsonwebtoken';
import { Users, Role, Lesson, Question, Response, Category } from "../models/association.js";
import { userSchema } from "../middleware/validation.js";

const authentication = {

  // Inscription d'un utilisateur
  async registerUser(req, res) {
    // Récupérer les données du body
    const { pseudo, password, mail, role_id } = req.body;

    // Vérifier que tous les champs sont présents
    if (!pseudo || !password || !mail ) {
      return res.status(400).json({ error: 'Tous les champs (pseudo, password, mail) sont obligatoires.' });
    }
    
    // Valider avec Joi, avec abortEarly: false pour récupérer toutes les erreurs
    const { error } = userSchema.validate({ pseudo, mail, password }, { abortEarly: false });
    if (error) {
      // Transformer les erreurs Joi en objet simple { champ: message }
      const errors = {};
      error.details.forEach(detail => {
        const key = detail.path[0];
        errors[key] = detail.message;
      });
      return res.status(400).json({ errors });
    }

    // Vérifier que le mot de passe est suffisamment complexe
    const schema = new PasswordValidator()
      .is().min(12)                  // 12 caractères mini
      .is().max(100)                 // Maximum 100
      .has().uppercase()             // 1 majuscule
      .has().lowercase()             // 1 minuscule
      .has().digits(1)               // 1 chiffre
      .has().symbols(1)              // 1 symbole
      .has().not().spaces();         // Pas d'espace
      
    if (! schema.validate(password)) {
      return res.status(400).json({ error: "Le mot de passe n'est pas suffisamment complexe. Veuillez utiliser au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole." });
    }

    // Vérifier si un utilisateur avec le même email n'existe pas déjà en BDD => faire une requête pour récupérer un utilisateur par son email
    const existing = await Users.findOne({ where: { mail: mail }});
    if (existing) {
      return res.status(409).json({ error: "L'email renseigné est déjà utilisé." });
    }

    // Hacher le mot de passe (pour ne pas le sauvegarder en clair)
    const hash = await argon2.hash(password);

    try {
      // Enregistrer la nouvelle liste en DB
      const result = await Users.create({ pseudo, password: hash, mail, role_id: 3 });

      // Retourner en JSON la nouvelle liste créée, avec toutes ses valeurs (id, title, position, etc.)
      res.status(201).json(result);
    } catch (error) {
      // On pourrait probablement fouiller un peu la variable error pour avoir un message d'erreur plus clair, mais c'est pas le sujet du cours
      res.status(400).json({ error: "Erreur lors de l'enregistrement en BDD"});
    }
  },

  // Connexion d'un utilisateur
  async login(req, res) {
    try {
      // Récupérer l'email et le mot de passe fourni depuis req.body
      const { password, mail } = req.body;

      // Valider la présence des champs
      if (! password || ! mail) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
      }

      // Récupérer en BDD l'utilisateur par son email, si pas d'utilisateur
      const user = await Users.findOne({ 
        where: { mail : mail },
        include: {
          model: Role,
          as: 'role',
          attributes: ['description']  // On veut le nom du rôle
        }
      });
      if (!user) {
        return res.status(400).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
      }

      // Vérifier si le mot de passe est valide, si les mots de passe ne match pas --> 400
      const passwordValid = await argon2.verify(user.password, password);
      if (! passwordValid) {
        return res.status(400).json({ error: "L'email et le mot de passe fournis ne correspondent pas." });
      }

      // Générer un token JWT pour l'utilisateur
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const tokenExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN;
      const token = jwt.sign({ 
        id: user.id, 
        mail: user.mail,
        role_id: user.role_id,
      }, accessTokenSecret, { expiresIn: tokenExpiry }  // Expiration 
      );
      return res.status(200).json({ token, message: "Connexion réussie",});
    } catch (err) {
      console.error('loginUser error →', err);
      return res.status(500).json({ error: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
  },

  async getCurrentUser(req, res) {
    try {
      const id = req.user.id;
 
      const user = await Users.findByPk(id, {
        attributes: { exclude: ['password'] },include: [
          {
            model: Role,
            as: 'role',
            attributes: ['description']
          },
          {
            model: Lesson,
            as: 'favorite_lessons',
            attributes: ['id', 'name', 'media'],
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['name']
              }
            ]
          },
          
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'text']
          },
          {
            model: Response,
            as: 'responses',
            attributes: ['id', 'text']
          }
        ]
      });
 
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
 
      res.json(user);
    } catch (err) {
      console.error("Erreur getCurrentUser :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
 
  
};

export { authentication };