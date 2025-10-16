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
  sequelize = new Sequelize(pgUrl, {
    dialect: 'postgres',
    logging: NODE_ENV === 'test' ? false : console.log,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    dialectOptions: {
      // Configuration SSL pour Render PostgreSQL
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
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