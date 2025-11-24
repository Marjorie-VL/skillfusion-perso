import axios from 'axios';

// Configuration de base d'Axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  timeout: 10000, // 10 secondes de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs globalement
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs HTTP
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      const { status, data } = error.response;
      const requestUrl = error.config?.url || '';
      
      switch (status) {
        case 401:
          // Ne pas rediriger automatiquement si c'est une erreur de connexion (route /login)
          // Laisser le composant LoginForm gérer l'erreur
          if (requestUrl.includes('/login')) {
            // Laisser le composant gérer l'erreur de connexion
            break;
          }
          // Token expiré ou invalide pour les autres routes
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès interdit:', data.message || 'Vous n\'avez pas les permissions nécessaires');
          break;
        case 404:
          // Ne pas logger les erreurs 404 pour la route /login (utilisateur non trouvé)
          if (!requestUrl.includes('/login')) {
            console.error('Ressource non trouvée:', data.message || 'La ressource demandée n\'existe pas');
          }
          break;
        case 500:
          console.error('Erreur serveur:', data.message || 'Une erreur interne s\'est produite');
          break;
        default:
          console.error('Erreur API:', data.message || 'Une erreur s\'est produite');
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Erreur réseau:', 'Impossible de contacter le serveur');
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
