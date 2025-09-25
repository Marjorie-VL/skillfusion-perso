import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // On prend le token après le mot "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Token d'accès manquant." });
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;  // Ajoute l'objet `user` dans la requête
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token d'accès expiré." });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: "Token d'accès invalide." });
    }
    return res.status(403).json({ error: "Erreur d'authentification." });
  }
}