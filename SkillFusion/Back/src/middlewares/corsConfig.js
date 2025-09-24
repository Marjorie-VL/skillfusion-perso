import cors from "cors";

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Autoriser toutes les origines "localhost" ou "127.0.0.1", peu importe le port
    if (!origin || /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});
