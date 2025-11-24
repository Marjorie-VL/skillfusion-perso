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
  // Log de l'URL (masquée pour sécurité)
  const maskedUrl = pgUrl.replace(/:([^:@]+)@/, ':****@'); // Masque le mot de passe
  console.log(`🔍 URL PostgreSQL (masquée): ${maskedUrl}`);
  
  // Extraire le nom de la base de données pour déboguer (format: postgresql://user:pass@host:port/dbname)
  // Supporte aussi postgres:// et les paramètres de requête
  let dbName = 'non détecté';
  let dbHost = 'non détecté';
  
  // Essayer plusieurs formats d'URL PostgreSQL
  // Format 1: postgresql://user:pass@host:port/dbname
  const match1 = pgUrl.match(/postgresql?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?\/]+)/);
  if (match1) {
    dbHost = match1[3];
    dbName = match1[5];
  } else {
    // Format 2: postgresql://user:pass@host/dbname (sans port)
    const match2 = pgUrl.match(/postgresql?:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?\/]+)/);
    if (match2) {
      dbHost = match2[3];
      dbName = match2[4];
    } else {
      // Format 3: Essayer d'extraire juste après le dernier /
      const lastSlash = pgUrl.lastIndexOf('/');
      const questionMark = pgUrl.indexOf('?', lastSlash);
      if (lastSlash > 0) {
        dbName = questionMark > 0 ? pgUrl.substring(lastSlash + 1, questionMark) : pgUrl.substring(lastSlash + 1);
        // Extraire le host (chercher @host:port ou @host/)
        const atIndex = pgUrl.indexOf('@');
        if (atIndex > 0) {
          const afterAt = pgUrl.substring(atIndex + 1);
          const colonIndex = afterAt.indexOf(':');
          const slashIndex = afterAt.indexOf('/');
          if (colonIndex > 0 && (slashIndex < 0 || colonIndex < slashIndex)) {
            dbHost = afterAt.substring(0, colonIndex);
          } else if (slashIndex > 0) {
            dbHost = afterAt.substring(0, slashIndex);
          }
        }
      }
    }
  }
  
  // Log pour déboguer (toujours afficher en production pour diagnostiquer)
  console.log(`🔍 Connexion DB - Host: ${dbHost} - Database: ${dbName}`);
  
  // Avertissement si le nom de la base semble tronqué
  if (dbName.length < 5 && dbName !== 'non détecté') {
    console.warn(`⚠️ ATTENTION: Le nom de la base de données semble tronqué: "${dbName}"`);
    console.warn(`⚠️ Vérifiez que l'URL PostgreSQL est complète dans les variables d'environnement Render`);
  }
  
  // Détecter si on est en local (pas de SSL requis) ou sur Render/production (SSL requis)
  // SSL requis si l'URL ne contient PAS "localhost" ni "127.0.0.1"
  // Cela couvre tous les cas : Render, autres hébergeurs cloud, production
  const isLocal = pgUrl.includes('localhost') || pgUrl.includes('127.0.0.1');
  
  const needsSSL = !isLocal;
  
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