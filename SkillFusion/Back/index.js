import "dotenv/config";
import express from "express";
import { router } from "./src/router.js";
import cors from "cors";
import { xss } from "express-xss-sanitizer";

// Création de l'app Express
const app = express();
// Body parser
app.use(express.urlencoded({ extended : true })); // Body applications/www-x-urlencoded
// Pour pouvoir utiliser le req.body et récupérer le JSON envoyé par le client
app.use(express.json());

app.use(cors({
  // On définit certains noms de domaines qu'on veut autoriser (certaines origines de notre appel)
  origin: (origin, callback) => {
    // Autoriser toutes les origines "localhost" ou "127.0.0.1", peu importe le port
    if (!origin || /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(origin)) {
      callback(null, true); // Autoriser l'origine
    } else {
      callback(new Error("Not allowed by CORS")); // Bloquer l'origine
    }
  },
}));

app.use(xss());

// Configuration du router
app.use(router);

// Lancement du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
  console.log(`📡 API ready to receive requests`);
});