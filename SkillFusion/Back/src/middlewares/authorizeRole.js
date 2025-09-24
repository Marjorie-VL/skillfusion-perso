export function isAdmin(req, res, next) {
  const user = req.user;
  
  if (user.role_id !== 1) {
    return res.status(403).json({ error: "Accès interdit. Vous n'êtes pas administrateur." });
  }
  next();  // L'utilisateur est admin, on continue
}

//Vérifier si l'utilisateur est soit "Administrateur" ou "Instructeur"
export function isAdminOrInstructor(req, res, next) {

  const user = req.user;
  if (user.role_id > 2) {
    return res.status(403).json({ error: "Accès interdit. Vous devez être administrateur ou instructeur." });
  }
  next();
}

// Vérifier que l'utilisateur modifie son propre compte, ou qu'il est admin
export function isSelfOrAdmin(req, res, next) {
  const user = req.user; // vient du middleware authenticateToken
  const targetUserId = parseInt(req.params.id, 10);

  if (Number.isNaN(targetUserId)) {
    return res.status(400).json({ error: "Identifiant utilisateur invalide." });
  }

  if (user.id === targetUserId || user.role_id === 1) {
    return next();
  }

  return res.status(403).json({ error: "Accès interdit. Vous ne pouvez modifier que votre propre profil." });
}