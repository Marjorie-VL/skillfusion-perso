import "dotenv/config";
import express from "express";

// Vérification des variables d'environnement critiques
if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn("⚠️  ACCESS_TOKEN_SECRET non défini, utilisation d'une valeur par défaut");
  process.env.ACCESS_TOKEN_SECRET = "default-secret-key-change-in-production";
}
if (!process.env.ACCESS_TOKEN_EXPIRES_IN) {
  process.env.ACCESS_TOKEN_EXPIRES_IN = "24h";
}
import { router } from "./src/router.js";
import { xss } from "express-xss-sanitizer";

// Middlewares custom
import { corsConfig } from "./src/middlewares/corsConfig.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

// Création de l'app Express
const app = express();

// ========================================
// MIDDLEWARES GLOBAUX
// ========================================

// 1. Sécurité : XSS sanitizer (AVANT la lecture du corps)
app.use(xss());

// 2. Parsing des données
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// 3. Configuration CORS
app.use(corsConfig);

// ========================================
// ROUTES
// ========================================

// Router principal
app.use(router);

// ========================================
// GESTION DES ERREURS
// ========================================

// Gestionnaire d'erreurs global (DOIT être en dernier)
app.use(errorHandler);

// ========================================
// LANCEMENT DU SERVEUR
// ========================================

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
  console.log(`�� API ready to receive requests`);
  console.log(`🔒 Security: XSS protection enabled`);
  console.log(`�� CORS: Configured for localhost`);
});