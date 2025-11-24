import cors from "cors";

export const corsConfig = cors({
  origin: function (origin, callback) {
    // Support pour ALLOWED_ORIGINS (liste séparée par virgules) ou FRONTEND_URL (URL unique)
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || 
                          (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);
    
    // Origines par défaut pour le développement local
    const defaultOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // Combiner les origines configurées avec les défauts
    const allAllowedOrigins = [...allowedOrigins, ...defaultOrigins];
    
    // En développement, autoriser toutes les origines locales
    if (process.env.NODE_ENV === 'development' && (!origin || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    // En production, vérifier strictement
    if (!origin || allAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
