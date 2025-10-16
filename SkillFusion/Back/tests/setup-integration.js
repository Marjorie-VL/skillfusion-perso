// Script de configuration pour les tests d'intégration
import { Client } from 'pg';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const testDatabaseName = 'skillfusion_test';

async function createTestDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres' // Se connecter à la DB par défaut
  });

  try {
    await client.connect();
    console.log('🔗 Connexion à PostgreSQL réussie');

    // Vérifier si la base de données de test existe
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDatabaseName]
    );

    if (result.rows.length === 0) {
      // Créer la base de données de test
      await client.query(`CREATE DATABASE ${testDatabaseName}`);
      console.log(`✅ Base de données ${testDatabaseName} créée`);
    } else {
      console.log(`ℹ️  Base de données ${testDatabaseName} existe déjà`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données de test:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function dropTestDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  });

  try {
    await client.connect();

    // Terminer toutes les connexions actives à la base de données de test
    await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `, [testDatabaseName]);

    // Supprimer la base de données de test
    await client.query(`DROP DATABASE IF EXISTS ${testDatabaseName}`);
    console.log(`🗑️  Base de données ${testDatabaseName} supprimée`);

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la base de données de test:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Exporter les fonctions pour Jest
export { createTestDatabase, dropTestDatabase };

// Si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'create') {
    createTestDatabase();
  } else if (command === 'drop') {
    dropTestDatabase();
  } else {
    console.log('Usage: node setup-integration.js [create|drop]');
  }
}
