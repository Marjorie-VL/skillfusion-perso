import "dotenv/config";
import { Client } from "pg";

// Détecter si on est en local (pas de SSL requis) ou sur Render (SSL requis)
const isLocal = process.env.PGHOST === 'localhost' || 
                process.env.PGHOST === '127.0.0.1' || 
                !process.env.PGHOST ||
                process.env.PG_URL?.includes('localhost');

const clientConfig = {
  connectionString: process.env.PG_URL,
};

// Ajouter SSL uniquement si on n'est pas en local
if (!isLocal) {
  clientConfig.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

const client = new Client(clientConfig);

client.connect();

export default client;