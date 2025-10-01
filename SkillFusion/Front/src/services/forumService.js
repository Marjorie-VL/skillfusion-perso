import api from './axios.js';

export const forumService = {
  // Récupérer tous les sujets du forum
  getAllTopics: async () => {
    const response = await api.get('/forum');
    return response.data;
  },

  // Récupérer un sujet par ID
  getTopicById: async (id) => {
    const response = await api.get(`/forum/${id}`);
    return response.data;
  },

  // Créer un nouveau sujet
  createTopic: async (topicData) => {
    const response = await api.post('/forum', topicData);
    return response.data;
  },

  // Modifier un sujet
  updateTopic: async (id, topicData) => {
    const response = await api.patch(`/forum/${id}`, topicData);
    return response.data;
  },

  // Supprimer un sujet
  deleteTopic: async (id) => {
    const response = await api.delete(`/forum/${id}`);
    return response.data;
  },

  // Ajouter une réponse à un sujet
  addReply: async (topicId, replyData) => {
    const response = await api.post(`/forum/${topicId}/reply`, replyData);
    return response.data;
  },

  // Modifier une réponse
  updateReply: async (topicId, replyId, replyData) => {
    const response = await api.patch(`/forum/${topicId}/reply/${replyId}`, replyData);
    return response.data;
  },

  // Supprimer une réponse
  deleteReply: async (topicId, replyId) => {
    const response = await api.delete(`/forum/${topicId}/reply/${replyId}`);
    return response.data;
  }
};
