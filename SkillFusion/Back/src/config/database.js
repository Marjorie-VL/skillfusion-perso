import "dotenv/config";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.PG_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

client.connect();

export default client;