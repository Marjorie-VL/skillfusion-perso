import { Question, Users } from "../models/association.js";
import { Response } from "../models/association.js";
import { messageSchema, responseSchema } from "../middleware/validation.js";


const forumController = {
	// Récupérer toutes les discussions
	async getAllMessages(req, res) {
		try {
			const forums = await Question.findAll({
			});

			res.status(200).json({forums});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Erreur lors de la récupération des sujets' });
		}
	},

	// Récupérer une discussion et ses réponses associées
	async getOneMessage(req, res) {
		try {
			const id = req.params.id
			const forums = await Question.findByPk(id, {
				include: [
					{
					model: Response,
					as: 'responses', // Inclure les réponses associées  
					include: [
						{
						model: Users,
						as: 'users', // Inclure l'auteur           
						}
					]// Inclure l'auteur de la réponse                        
					},  
					{
					model: Users,
					as: 'users', // Inclure l'auteur           
					},  
				],
				});

			if (!forums) {
				res.status(404).json({ error: 'Erreur lors de la récupération du sujet' });
			}

			res.status(200).json({forums});

		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Erreur lors de la récupération des sujets'});
		}
	},

	// Ajouter une discussion
	async addMessage(req, res) {
		try {
			const { title, text} = req.body;
			const userId = req.user.id;
			
			// Vérifier que tous les champs sont présents
			if (!title ||!text) {
				return res.status(400).json({ error: "Les champs titre et texte sont obligatoires !" });
			}
		
			//  Valider avec Joi
			const { error } = messageSchema.validate({ title, text }, { abortEarly: false });
			if (error) {
				// Transformer les erreurs Joi en objet simple { champ: message }
				const errors = {};
				error.details.forEach(detail => {
				  const key = detail.path[0];
				  errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			  }
			
			// Vérifie que la question n'existe pas déjà
			const existingQuestion = await Question.findOne({ where: { text } });
			if (existingQuestion) {
				return res.status(409).json({ error: "Ce sujet existe déjà" });
			}

			const forum = await Question.create({ title, text, users_id: userId });
	
			res.status(201).json(forum);

		} catch (error) {
			console.error(error); 
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD !!!" });
		}
	},

	// Ajouter une réponse à une discussion
	async addMessageToResponse(req, res) {
		try {
			const { text } = req.body;
			const questionId = req.params.id;
			const userId = req.user.id; // récupéré grâce à ton middleware d'auth

			// Vérifier que tous les champs sont présents
			if (!text ) {
				return res.status(400).json({ error: "Le champ 'text' est obligatoire !" });
			}
			  //  Valider avec Joi
			const { error } = responseSchema.validate({ text }, { abortEarly: false });
			if (error) {
				// Transformer les erreurs Joi en objet simple { champ: message }
				const errors = {};
				error.details.forEach(detail => {
				  const key = detail.path[0];
				  errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			  }
			// Vérifie que la question existe
			const question = await Question.findByPk(questionId)
			if (!question) {
				return res.status(404).json({ error: "Sujet introuvable" });
			}

			 // Crée la réponse avec les bonnes données
			 const response = await Response.create({
				text,
				question_id: questionId,
				users_id: userId,
			  });
			res.status(201).json(response);

		} catch (error) {
			console.error(error); // Ajoute ça pour voir le vrai problème s'il y en a un
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},

	// Effacer une discussion
	async deleteMessage(req, res) {
		try {
				
			const message = await Question.findByPk(req.params.id);
			if (!message) {
				return res.status(404).json({ error: "Question introuvable" });
			}
					
				// Suppression de la discussion
			await message.destroy();
									
			res.status(200).json({ 
				message: "Question supprimée avec succès",
			});

		} catch (error) {
			console.error(error); 
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},

	// Effacer un message
	async deleteResponse(req, res) {
		try {
			const { answer_id } = req.params; // ID de la réponse à supprimer
			const { id } = req.params; // ID de la question

			// Vérifications des paramètres
			if (!answer_id || !id) {
				res.status(400).json({ error: "Le champ 'answer_id' et 'id' est obligatoire !" });
			}
			
			// Chercher la réponse spécifique
			const response = await Response.findOne({
				where: {
					id: answer_id,
					question_id: id
				}
			});

			if (!response) {
				res.status(404).json({ error: "Réponse introuvable pour cette discussion" });
			}

			// Suppression de la réponse
			await response.destroy();;
	
			res.status(201).json(response);

		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},
}

export { forumController };

