import 'dotenv/config'; // Cette ligne DOIT être en haut et sans erreur
import { Sequelize } from 'sequelize';

// Préférence: PostgreSQL via variables d'environnement, sinon fallback SQLite
const {
  PG_URL,
  DATABASE_URL,
  PGHOST = 'localhost',
  PGPORT = '5433',
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  NODE_ENV,
} = process.env;

let sequelize;

// Construire une URL si non fournie mais que les éléments sont présents
const buildPostgresUrl = () => {
  if (PGDATABASE && PGUSER && PGPASSWORD) {
    return `postgres://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
  }
  return null;
};

const pgUrl = PG_URL || DATABASE_URL || buildPostgresUrl();

if (pgUrl) {
  // Détecter si on est en local (pas de SSL requis) ou sur Render/production (SSL requis)
  // SSL requis si l'URL ne contient PAS "localhost" ni "127.0.0.1"
  // Cela couvre tous les cas : Render, autres hébergeurs cloud, production
  const isLocal = pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1');
  
  const needsSSL = !isLocal;
  
  // Log pour déboguer (seulement en développement)
  if (NODE_ENV !== 'production') {
    console.log(`🔍 Connexion DB: ${isLocal ? 'LOCAL' : 'DISTANTE'} - SSL: ${needsSSL ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
  }
  
  sequelize = new Sequelize(pgUrl, {
    dialect: 'postgres',
    logging: NODE_ENV === 'test' ? false : console.log,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    dialectOptions: needsSSL ? {
      // Configuration SSL pour Render PostgreSQL (distant) ou production
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
    } : {},
    pool: {
      max: 5,              // Nombre maximum de connexions dans le pool
      min: 0,              // Nombre minimum de connexions dans le pool
      acquire: 30000,      // Temps max (ms) pour obtenir une connexion avant timeout
      idle: 10000          // Temps max (ms) qu'une connexion peut être inactive avant d'être libérée
    },
  });
} else {
  // Fallback SQLite pour un démarrage sans config PG
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: NODE_ENV === 'test' ? false : console.log,
  });
}

export { sequelize }