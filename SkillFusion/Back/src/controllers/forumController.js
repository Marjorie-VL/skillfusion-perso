import { Topic, User } from "../models/association.js";
import { Reply } from "../models/association.js";
import { messageSchema, responseSchema } from "../middlewares/validation.js";


const forumController = {
	// Récupérer tous les sujets de discussion
	async getAllTopics(req, res) {
		try {
			const discussions = await Topic.findAll({
			});

			res.status(200).json({discussions});
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Erreur lors de la récupération des sujets' });
		}
	},

	// Récupérer une discussion et ses réponses associées
	async getOneDiscussion(req, res) {
		try {
			const id = req.params.id
			const discussion = await Topic.findByPk(id, {
				include: [
					{
					model: Reply,
					as: 'replies', // Inclure les réponses associées  
					include: [
						{
						model: User,
						as: 'user', // Inclure l'auteur           
						}
					]// Inclure l'auteur de la réponse                        
					},    
				],
				});

			if (!discussion) {
				res.status(404).json({ error: 'Erreur lors de la récupération du sujet' });
			}

			res.status(200).json({discussion});

		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Erreur lors de la récupération des sujets'});
		}
	},

	// Ajouter une discussion
	async addTopic(req, res) {
		try {
			const { title, content} = req.body;
			const userId = req.user.id;
			
			// Vérifier que tous les champs sont présents
			if (!title ||!content) {
				return res.status(400).json({ error: "Les champs titre et content sont obligatoires !" });
			}
		
			//  Valider avec Joi
			const { error } = messageSchema.validate({ title, content }, { abortEarly: false });
			if (error) {
				// Transformer les erreurs Joi en objet simple { champ: message }
				const errors = {};
				error.details.forEach(detail => {
				  const key = detail.path[0];
				  errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			  }
			
			// Vérifie que le sujet n'existe pas déjà
			const existingTopic = await Topic.findOne({ where: { content } });
			if (existingTopic) {
				return res.status(409).json({ error: "Ce sujet existe déjà" });
			}

			const topic = await Topic.create({ title, content, user_id: userId });
	
			res.status(201).json(topic);

		} catch (error) {
			console.error(error); 
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD !!!" });
		}
	},

	// Ajouter une réponse à une discussion
	async addReply(req, res) {
		try {
			const { content } = req.body;
			const topicId = req.params.id;
			const userId = req.user.id; // récupéré grâce à ton middleware d'auth

			// Vérifier que tous les champs sont présents
			if (!content ) {
				return res.status(400).json({ error: "Le champ 'content' est obligatoire !" });
			}
			  //  Valider avec Joi
			const { error } = responseSchema.validate({ content }, { abortEarly: false });
			if (error) {
				// Transformer les erreurs Joi en objet simple { champ: message }
				const errors = {};
				error.details.forEach(detail => {
				  const key = detail.path[0];
				  errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			  }
			// Vérifie que le sujet existe
			const topic = await Topic.findByPk(topicId)
			if (!topic) {
				return res.status(404).json({ error: "Sujet introuvable" });
			}

			 // Crée la réponse avec les bonnes données
			 const reply = await Reply.create({
				content,
				topic_id: topicId,
				user_id: userId,
			  });
			res.status(201).json(reply);

		} catch (error) {
			console.error(error); // Ajoute ça pour voir le vrai problème s'il y en a un
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},

	// Effacer une discussion (sujet + réponses associées)
	async deleteDiscussion(req, res) {
		try {
				
			const message = await Topic.findByPk(req.params.id);
			if (!message) {
				return res.status(404).json({ error: "Discussion introuvable" });
			}
					
				// Suppression de la discussion
			await message.destroy();
									
			res.status(200).json({ 
				message: "Discussion supprimée avec succès",
			});

		} catch (error) {
			console.error(error); 
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},

	// Effacer une réponse
	async deleteReply(req, res) {
		try {
			const { reply_id } = req.params; // ID de la réponse à supprimer
			const { id } = req.params; // ID de la discussion

			// Vérifications des paramètres
			if (!reply_id || !id) {
				res.status(400).json({ error: "Le champ 'reply_id' et 'id' est obligatoire !" });
			}
			
			// Chercher la réponse spécifique
			const reply = await Reply.findOne({
				where: {
					id: reply_id,
					topic_id: id
				}
			});

			if (!reply) {
				res.status(404).json({ error: "Réponse introuvable pour cette discussion" });
			}

			// Suppression de la réponse
			await reply.destroy();;
	
			res.status(201).json(reply);

		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Erreur lors de l'enregistrement en BDD" });
		}
	},
}

export { forumController };

