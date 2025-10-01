import api from './axios.js';

export const lessonService = {
  // Récupérer toutes les leçons
  getAllLessons: async (params = {}) => {
    const response = await api.get('/lessons', { params });
    return response.data;
  },

  // Récupérer une leçon par ID
  getLessonById: async (id) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  // Créer une nouvelle leçon
  createLesson: async (lessonData) => {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  },

  // Modifier une leçon
  updateLesson: async (id, lessonData) => {
    const response = await api.patch(`/lessons/${id}`, lessonData);
    return response.data;
  },

  // Supprimer une leçon
  deleteLesson: async (id) => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  // Ajouter une leçon aux favoris
  addToFavorites: async (lessonId, user) => {
    const response = await api.post(`/lessons/${lessonId}/favorite`, { user });
    return response.data;
  },

  // Retirer une leçon des favoris
  removeFromFavorites: async (lessonId, user) => {
    const response = await api.delete(`/lessons/${lessonId}/favorite`, { data: { user } });
    return response.data;
  },

  // Alias pour deleteFavorite (même fonction que removeFromFavorites)
  deleteFavorite: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}/favorite`);
    return response.data;
  }
};
