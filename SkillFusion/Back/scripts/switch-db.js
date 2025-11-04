#!/usr/bin/env node

/**
 * Script pour basculer facilement entre base locale et Render
 * 
 * Usage:
 *   node scripts/switch-db.js local    # Utilise la base locale
 *   node scripts/switch-db.js render   # Utilise la base Render
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

const mode = process.argv[2]; // 'local' ou 'render'

if (!mode || !['local', 'render'].includes(mode)) {
  console.error('❌ Usage: node scripts/switch-db.js [local|render]');
  console.error('   Exemple: node scripts/switch-db.js local');
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error('❌ Fichier .env introuvable !');
  console.error(`   Créez le fichier : ${envPath}`);
  process.exit(1);
}

try {
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Décommenter la ligne correspondante et commenter l'autre
  let newContent = envContent;
  
  if (mode === 'local') {
    // Commenter Render
    newContent = newContent.replace(
      /^PG_URL=postgres:\/\/[^\s]+$/m,
      (match) => match.includes('localhost') || match.includes('127.0.0.1') 
        ? match 
        : `# ${match}`
    );
    // Décommenter Local
    newContent = newContent.replace(
      /^#\s*PG_URL=postgresql:\/\/[^\s]+localhost[^\s]+$/m,
      (match) => match.replace(/^#\s*/, '')
    );
    // S'assurer qu'il y a une ligne PG_URL locale active
    if (!newContent.match(/^PG_URL=postgresql:\/\/[^\s]+localhost[^\s]+$/m)) {
      // Ajouter si elle n'existe pas
      newContent = newContent.replace(
        /^(#?\s*PG_URL=.*)$/m,
        `PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion\n$1`
      );
    }
    
    console.log('✅ Basculé vers la base de données LOCALE');
    console.log('   PG_URL=postgresql://postgres:postgres@localhost:5432/skillfusion');
  } else {
    // Commenter Local
    newContent = newContent.replace(
      /^PG_URL=postgresql:\/\/[^\s]+localhost[^\s]+$/m,
      (match) => `# ${match}`
    );
    // Décommenter Render
    newContent = newContent.replace(
      /^#\s*PG_URL=postgres:\/\/[^\s]+render[^\s]+$/m,
      (match) => match.replace(/^#\s*/, '')
    );
    
    console.log('✅ Basculé vers la base de données RENDER');
    console.log('   Vérifiez que votre URL Render est bien configurée');
  }
  
  writeFileSync(envPath, newContent);
  console.log('');
  console.log('💡 Redémarrez votre serveur pour appliquer les changements');
  
} catch (error) {
  console.error('❌ Erreur lors de la modification du .env:', error.message);
  process.exit(1);
}

