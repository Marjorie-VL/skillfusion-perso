import api from './axios.js';

export const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Obtenir les informations de l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // Déconnexion (côté client)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
