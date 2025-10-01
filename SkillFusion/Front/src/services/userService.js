import api from './axios.js';

export const userService = {
  // Récupérer tous les utilisateurs (admin)
  getAllUsers: async () => {
   
      const response = await api.get('/users');
      return response.data;   
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {   
      const response = await api.get(`/users/${id}`);
      return response.data;   
  },

  // Modifier un utilisateur
  updateUser: async (id, userData) => {   
      const response = await api.patch(`/users/${id}`, userData);
      return response.data;   
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {  
      const response = await api.delete(`/users/${id}`);
      return response.data;    
  },

  // Changer le rôle d'un utilisateur
  changeUserRole: async (id, roleId) => {
      const response = await api.patch(`/users/${id}/role`, { role_id: roleId });
      return response.data;
  },

  // Récupérer les favoris d'un utilisateur
  getUserFavorites: async (id) => { 
      const response = await api.get(`/users/${id}/favorites`);
      return response.data;     
  }
};
