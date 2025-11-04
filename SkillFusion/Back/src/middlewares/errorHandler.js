export const errorHandler = (err, req, res, next) => {
    console.error('Erreur:', err);
    
    // Erreurs CORS
    if (err.message === "Not allowed by CORS" || err.message === "Non autorisé par CORS") {
        return res.status(403).json({ error: "Forbidden by CORS" });
    }
    
    // Erreurs de validation Joi
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Données invalides',
            details: err.details.map(detail => detail.message)
        });
    }
    
    // Erreurs Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Erreur de validation',
            details: err.errors.map(error => error.message)
        });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Données déjà existantes',
            field: err.errors[0].path
        });
    }
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Référence invalide',
            message: 'La ressource référencée n\'existe pas'
        });
    }
    
    // Erreur par défaut
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
};
  