import { Topic, User } from "../models/association.js";
import { Reply } from "../models/association.js";
import { messageSchema, responseSchema } from "../middlewares/validation.js";


const forumController = {
	// Récupérer tous les sujets de discussion
	async getAllTopics(req, res) {
		try {
			const discussions = await Topic.findAll({
				include: [
					{
						model: User,
						as: 'user',
						attributes: ['id', 'user_name']
					}
				]
			});

			return res.status(200).json(discussions);
		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
		}
	},

	// Récupérer une discussion et ses réponses associées
	async getOneDiscussion(req, res) {
		try {
			const id = req.params.id
			const discussion = await Topic.findByPk(id, {
				include: [
					{
						model: User,
						as: 'user',
						attributes: ['id', 'user_name']
					},
					{
						model: Reply,
						as: 'replies', // Inclure les réponses associées  
						include: [
							{
								model: User,
								as: 'user', // Inclure l'auteur           
								attributes: ['id', 'user_name']
							}
						]// Inclure l'auteur de la réponse                        
					},    
				],
			});

			if (!discussion) {
				return res.status(404).json({ error: 'Discussion non trouvée' });
			}

			return res.status(200).json(discussion);

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
		}
	},

	// Ajouter une discussion
	async addTopic(req, res) {
		try {
			const { title, content} = req.body;
			const userId = req.user.id;
			
			//  Valider avec Joi
			const { error } = messageSchema.validate({ title, text: content }, { abortEarly: false });
			if (error) {
				// Transformer les erreurs Joi en objet simple { champ: message }
				const errors = {};
				error.details.forEach(detail => {
				  const key = detail.path[0];
				  errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			  }
			
			// Vérifie que le titre n'existe pas déjà
			const existingTopic = await Topic.findOne({ where: { title } });
			if (existingTopic) {
				return res.status(409).json({ error: "Un sujet avec ce titre existe déjà" });
			}

			const topic = await Topic.create({ title, content, user_id: userId });
	
			return res.status(201).json(topic);

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message); 
			return res.status(500).json({ error: error.message });
		}
	},

	// Modifier un sujet de discussion
	async updateTopic(req, res) {
		try {
			const { title, content } = req.body;
			const topicId = req.params.id;
			const userId = req.user.id;

			// Vérifier que le sujet existe
			const topic = await Topic.findByPk(topicId);
			if (!topic) {
				return res.status(404).json({ error: "Sujet introuvable" });
			}

			// Vérifier que l'utilisateur est le propriétaire ou admin
			if (topic.user_id !== userId && req.user.role_id !== 1) {
				return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres sujets" });
			}

			// Valider avec Joi
			const { error } = messageSchema.validate({ title, text: content }, { abortEarly: false });
			if (error) {
				const errors = {};
				error.details.forEach(detail => {
					const key = detail.path[0];
					errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			}

			// Vérifier que le titre n'existe pas déjà (si changé)
			if (title !== topic.title) {
				const existingTopic = await Topic.findOne({ where: { title } });
				if (existingTopic) {
					return res.status(409).json({ error: "Un sujet avec ce titre existe déjà" });
				}
			}

			// Mettre à jour le sujet
			await topic.update({ title, content });

			return res.status(200).json({ 
				message: "Sujet modifié avec succès",
				topic: topic
			});

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
		}
	},

	// Ajouter une réponse à une discussion
	async addReply(req, res) {
		try {
			const { content } = req.body;
			const topicId = req.params.id;
			const userId = req.user.id; // récupéré grâce à ton middleware d'auth

			//  Valider avec Joi
			const { error } = responseSchema.validate({ text: content }, { abortEarly: false });
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
			return res.status(201).json(reply);

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
		}
	},

	// Modifier une réponse
	async updateReply(req, res) {
		try {
			const { content } = req.body;
			const { topicId, replyId } = req.params;
			const userId = req.user.id;

			// Vérifier que la réponse existe
			const reply = await Reply.findOne({
				where: {
					id: replyId,
					topic_id: topicId
				}
			});

			if (!reply) {
				return res.status(404).json({ error: "Réponse introuvable" });
			}

			// Vérifier que l'utilisateur est le propriétaire ou admin
			if (reply.user_id !== userId && req.user.role_id !== 1) {
				return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres réponses" });
			}

			// Valider avec Joi
			const { error } = responseSchema.validate({ text: content }, { abortEarly: false });
			if (error) {
				const errors = {};
				error.details.forEach(detail => {
					const key = detail.path[0];
					errors[key] = detail.message;
				});
				return res.status(400).json({ errors });
			}

			// Mettre à jour la réponse
			await reply.update({ content });

			return res.status(200).json({ 
				message: "Réponse modifiée avec succès",
				reply: reply
			});

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
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
									
			return res.status(200).json({ 
				message: "Discussion supprimée avec succès",
			});

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message); 
			return res.status(500).json({ error: error.message });
		}
	},

	// Effacer une réponse
	async deleteReply(req, res) {
		try {
			const { reply_id } = req.params; // ID de la réponse à supprimer
			const { id } = req.params; // ID de la discussion

			// Vérifications des paramètres
			if (!reply_id || !id) {
				return res.status(400).json({ error: "Les paramètres 'reply_id' et 'id' sont obligatoires !" });
			}
			
			// Chercher la réponse spécifique
			const reply = await Reply.findOne({
				where: {
					id: reply_id,
					topic_id: id
				}
			});

			if (!reply) {
				return res.status(404).json({ error: "Réponse introuvable pour cette discussion" });
			}

			// Suppression de la réponse
			await reply.destroy();
	
			return res.status(200).json({ 
				message: "Réponse supprimée avec succès",
				reply: reply
			});

		} catch (error) {
			console.error('❌ Erreur Sequelize →', error.message);
			return res.status(500).json({ error: error.message });
		}
	},
}

export { forumController };

