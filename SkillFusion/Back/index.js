import "dotenv/config";
import express from "express";
import { router } from "./src/router.js";
import { xss } from "express-xss-sanitizer";

// Middlewares custom
import { corsConfig } from "./src/middlewares/corsConfig.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

// Création de l'app Express
const app = express();

// --- Middlewares globaux ---
// Sécurité : XSS sanitizer (avant la lecture du corps)
app.use(xss());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(corsConfig);

// --- Router principal ---
app.use(router);

// --- Gestion des erreurs ---
app.use(errorHandler);

// --- Router principal ---
app.use(router);

// --- Lancement du serveur ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
  console.log(`📡 API ready to receive requests`);
});
