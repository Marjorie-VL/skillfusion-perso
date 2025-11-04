#!/usr/bin/env node

/**
 * Script de synchronisation de la base de données
 * Exporte depuis Render et importe en local
 * 
 * Usage:
 *   RENDER_DB_URL="postgres://..." node scripts/sync-db.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, unlinkSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const RENDER_DB_URL = process.env.RENDER_DB_URL || process.env.DATABASE_URL;
const LOCAL_DB_NAME = process.env.PGDATABASE || 'skillfusion';
const LOCAL_DB_USER = process.env.PGUSER || 'postgres';
const LOCAL_DB_HOST = process.env.PGHOST || 'localhost';
const LOCAL_DB_PORT = process.env.PGPORT || '5432';
const BACKUP_FILE = 'backup_render.dump';

if (!RENDER_DB_URL) {
  console.error('❌ ERREUR: RENDER_DB_URL ou DATABASE_URL doit être défini dans .env');
  console.error('   Ajoutez dans votre .env:');
  console.error('   RENDER_DB_URL="postgres://user:password@host:port/database"');
  process.exit(1);
}

async function syncDatabase() {
  try {
    console.log('🔄 Export de la base de données Render...');
    console.log(`   Source: ${RENDER_DB_URL.replace(/:[^:@]+@/, ':****@')}`);
    
    // Supprimer l'ancien backup si il existe
    if (existsSync(BACKUP_FILE)) {
      unlinkSync(BACKUP_FILE);
      console.log('   Ancien backup supprimé');
    }
    
    await execAsync(
      `pg_dump "${RENDER_DB_URL}" --no-owner --no-acl --clean --if-exists -F c -f ${BACKUP_FILE}`
    );
    
    console.log(`✅ Export terminé: ${BACKUP_FILE}`);
    console.log('');
    console.log('📥 Import dans la base locale...');
    console.log(`   Destination: ${LOCAL_DB_USER}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}`);
    
    // Construire la commande pg_restore
    const pgRestoreCmd = `pg_restore -h ${LOCAL_DB_HOST} -p ${LOCAL_DB_PORT} -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -v --clean --if-exists ${BACKUP_FILE}`;
    
    // Utiliser PGPASSWORD si disponible
    const env = process.env.PGPASSWORD 
      ? { ...process.env, PGPASSWORD: process.env.PGPASSWORD }
      : process.env;
    
    await execAsync(pgRestoreCmd, { env });
    
    console.log('');
    console.log('✅ Synchronisation terminée avec succès !');
    console.log('');
    console.log('💡 Vous pouvez maintenant utiliser votre base locale avec:');
    console.log(`   PG_URL=postgresql://${LOCAL_DB_USER}:****@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Erreur lors de la synchronisation:');
    console.error(error.message);
    console.error('');
    console.error('💡 Vérifiez:');
    console.error('   1. Que PostgreSQL est installé et démarré');
    console.error('   2. Que la base de données locale existe');
    console.error('   3. Que les identifiants sont corrects dans .env');
    process.exit(1);
  }
}

syncDatabase();

