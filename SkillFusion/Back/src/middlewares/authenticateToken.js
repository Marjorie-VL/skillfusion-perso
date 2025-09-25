import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // On prend le token après le mot "Bearer"

  console.log("🔐 authenticateToken - URL:", req.url);
  console.log("🔐 authenticateToken - AuthHeader:", authHeader);
  console.log("🔐 authenticateToken - Token extrait:", token ? token.substring(0, 20) + "..." : "null");

  if (!token) {
    console.log("❌ Token manquant");
    return res.status(401).json({ error: "Token d'accès manquant." });
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Token valide pour l'utilisateur:", user.id);
    req.user = user;  // Ajoute l'objet `user` dans la requête
    next();
  } catch (err) {
    console.log("❌ Erreur de validation du token:", err.name, err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token d'accès expiré." });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: "Token d'accès invalide." });
    }
    return res.status(403).json({ error: "Erreur d'authentification." });
  }
}