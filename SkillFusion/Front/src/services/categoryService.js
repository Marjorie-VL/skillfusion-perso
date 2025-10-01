import api from './axios.js';

export const categoryService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Récupérer une catégorie par ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Récupérer les leçons d'une catégorie
  getLessonsByCategory: async (id) => {
    const response = await api.get(`/categories/${id}/lessons`);
    return response.data;
  },

  // Créer une nouvelle catégorie
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Modifier une catégorie
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Supprimer une catégorie
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};