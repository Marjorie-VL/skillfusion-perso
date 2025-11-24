import 'dotenv/config';
import { Sequelize } from 'sequelize';

const pgUrl = process.env.PG_URL;

console.log('🔍 Diagnostic de connexion PostgreSQL\n');
console.log('📋 Configuration détectée:');
console.log(`   PG_URL: ${pgUrl ? '✅ Défini' : '❌ Non défini'}`);

if (!pgUrl) {
  console.error('\n❌ ERREUR: PG_URL n\'est pas défini dans votre fichier .env');
  process.exit(1);
}

// Extraire les infos de l'URL
const match = pgUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (match) {
  const [, user, password, host, port, database] = match;
  console.log(`   Utilisateur: ${user}`);
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${database}`);
  console.log(`   Password: ${'*'.repeat(password.length)}`);
}

console.log('\n🔌 Tentative de connexion...');

const sequelize = new Sequelize(pgUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: pgUrl.includes('localhost') ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion réussie à PostgreSQL !');
    return sequelize.close();
  })
  .then(() => {
    console.log('✅ Connexion fermée proprement');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERREUR de connexion:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.original?.code || 'N/A'}`);
    
    if (error.original?.code === 'ECONNREFUSED') {
      const port = match ? match[4] : '5432';
      console.error('\n💡 SOLUTION:');
      console.error('   1. Vérifiez que PostgreSQL est démarré');
      console.error(`   2. Vérifiez que le port est correct (${port} dans votre config)`);
      console.error('   3. Vérifiez que le service PostgreSQL est actif');
      console.error('   4. Vérifiez que PostgreSQL écoute bien sur ce port');
    } else if (error.original?.code === '28P01') {
      console.error('\n💡 SOLUTION:');
      console.error('   1. Vérifiez le nom d\'utilisateur et le mot de passe');
      console.error('   2. Vérifiez que l\'utilisateur existe dans PostgreSQL');
    } else if (error.original?.code === '3D000') {
      console.error('\n💡 SOLUTION:');
      console.error('   1. La base de données n\'existe pas');
      console.error('   2. Créez-la avec: CREATE DATABASE skillfusion;');
    }
    
    process.exit(1);
  });

