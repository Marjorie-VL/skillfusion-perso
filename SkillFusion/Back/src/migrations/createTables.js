// Importe sequelize (notre connexion avec la DB) depuis associations.js pour appliquer les models et les associations avant de pouvoir faire la migration
import { sequelize } from "../models/association.js";

try {
  // Supprimer d'anciens artefacts de schéma non gérés par les models actuels
  await sequelize.query('DROP TABLE IF EXISTS "users_has_favorites" CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS "users" CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS "roles" CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS "questions" CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS "responses" CASCADE;');

  // Nettoie la DB en supprimant les tables 
  await sequelize.drop();
  
  // Recrée les tables vides
  await sequelize.sync({ force:true });

  console.log("✅ Tables créées avec succès !");
  
  // Quitte le process => ferme l'exécution du fichier et réaffiche l'invite de commande dans le terminal sans devoir faire un Ctrl + C
  // Le chiffre 0 est utilisé pour dire "pas d'erreur"
  process.exit(0);
	
} catch (error) {
  console.error("❌ Erreur lors de la création des tables :", error);
  // Le chiffre 1 est utilisé pour dire "erreur"
  process.exit(1);
}