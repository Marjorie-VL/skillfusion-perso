export const errorHandler = (err, req, res, next) => {
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({ error: "Forbidden by CORS" });
    }
  
    console.error("🔥 Erreur serveur :", err);
    res.status(500).json({ error: "Internal Server Error" });
  };
  