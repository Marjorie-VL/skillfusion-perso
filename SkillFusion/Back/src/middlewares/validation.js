import Joi from 'joi';

// Schéma pour l'inscription d'un utilisateur
export const userSchema = Joi.object({
  user_name: Joi.string().min(3).max(30).required().messages({
    'string.empty': 'Le nom d\'utilisateur ne peut pas être vide.',
    'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères.',
    'string.max': 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères.',
    'any.required': 'Le nom d\'utilisateur est obligatoire.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': "L'email ne peut pas être vide.",
    'string.email': "L'email doit être valide.",
    'any.required': "L'email est obligatoire."
  }),
  password: Joi.string()
  .min(12)
  .max(100)
  .pattern(/[A-Z]/, 'majuscule')     // au moins une majuscule
  .pattern(/[a-z]/, 'minuscule')     // au moins une minuscule
  .pattern(/[0-9]/, 'chiffre')       // au moins un chiffre
  .pattern(/[!@#$%^&*(),.?":{}|<>_-]/, 'symbole') // au moins un symbole
  .pattern(/^\S*$/, 'pas d\'espace') // pas d'espaces
  .required()
  .messages({
    'string.empty': "Le mot de passe est requis.",
    'string.min': "Le mot de passe doit contenir au moins 12 caractères.",
    'string.max': "Le mot de passe ne doit pas dépasser 100 caractères.",
    'string.pattern.name': "Le mot de passe doit contenir au moins un {#name}.",
    'any.required': "Le mot de passe est obligatoire."
  })
});

// Schéma pour la connexion d'un utilisateur
export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Le email ne peut pas être vide.',
    'string.email': "L'email doit être valide.",
    'any.required': "L'email est obligatoire."
  }),
  password: Joi.string()
  .min(12)
  .max(100)
  .pattern(/[A-Z]/, 'majuscule')     // au moins une majuscule
  .pattern(/[a-z]/, 'minuscule')     // au moins une minuscule
  .pattern(/[0-9]/, 'chiffre')       // au moins un chiffre
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'symbole') // au moins un symbole
  .pattern(/^\S*$/, 'pas d\'espace') // pas d'espaces
  .messages({
    'string.empty': "Le mot de passe est requis.",
    'string.min': "Le mot de passe doit contenir au moins 12 caractères.",
    'string.max': "Le mot de passe ne doit pas dépasser 100 caractères.",
    'string.pattern.name': "Le mot de passe doit contenir au moins un {#name}.",
  })
});

// Schéma pour la modification d'un utilisateur
export const updateUserSchema = Joi.object({
  user_name: Joi.string().min(3).max(30).messages({
    'string.empty': 'Le pseudo ne peut pas être vide.',
    'string.min': 'Le pseudo doit contenir au moins 3 caractères.',
    'string.max': 'Le pseudo ne doit pas dépasser 30 caractères.',
  }),
  email: Joi.string().email().messages({
    'string.empty': "L'email ne peut pas être vide.",
    'string.email': "L'email doit être valide.",
  }),
  password: Joi.string()
  .min(12)
  .max(100)
  .pattern(/[A-Z]/, 'majuscule')     // au moins une majuscule
  .pattern(/[a-z]/, 'minuscule')     // au moins une minuscule
  .pattern(/[0-9]/, 'chiffre')       // au moins un chiffre
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'symbole') // au moins un symbole
  .pattern(/^\S*$/, 'pas d\'espace') // pas d'espaces
  .messages({
    'string.empty': "Le mot de passe est requis.",
    'string.min': "Le mot de passe doit contenir au moins 12 caractères.",
    'string.max': "Le mot de passe ne doit pas dépasser 100 caractères.",
    'string.pattern.name': "Le mot de passe doit contenir au moins un {#name}.",
  })
});

// Schéma pour la création d'une leçon
export const lessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Le nom du cours ne peut pas être vide.',
    'string.min': 'Le nom doit contenir au moins 3 caractères.',
    'string.max': 'Le nom du cours ne doit pas dépasser 255 caractères.',
    'any.required': 'Le nom du cours est obligatoire.',
  }),
  description: Joi.string().min(3).required().messages({
    'string.empty': 'Le contenu du texte ne peut pas être vide.',
    'string.min': 'Le contenu du texte doit contenir au moins 3 caractères.',
    'any.required': 'Le contenu du texte est obligatoire.',
  }),
  category_id: Joi.number().integer().required().messages({
    'any.required': 'La catégorie est obligatoire.',
  }),
  user_id: Joi.number().integer().required().messages({
    'any.required': 'L\'utilisateur est obligatoire.',
  }),
  media_url: Joi.string().allow(null, '').optional(),
  media_alt: Joi.string().min(1).allow(null, '').optional(),
  materials: Joi.array().items(Joi.object({
    name: Joi.string().min(1).required(),
    quantity: Joi.number().integer().min(1).optional()
  })).optional(),
  steps: Joi.array().items(Joi.object({
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    media_url: Joi.string().allow(null, '').optional(),
    media_alt: Joi.string().min(1).allow(null, '').optional()
  })).optional()
});

// Schéma pour la modification d'une leçon
export const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional().messages({
    'string.empty': 'Le titre du cours ne peut pas être vide.',
    'string.min': 'Le titre du cours doit contenir au moins 3 caractères.',
    'string.max': 'Le titre du cours ne doit pas dépasser 255 caractères.',
  }),
  description: Joi.string().min(3).optional().messages({
    'string.empty': 'La description ne peut pas être vide.',
    'string.min': 'La description doit contenir au moins 3 caractères.',
  }),
  category_id: Joi.number().integer().optional(),
  user_id: Joi.number().integer().optional(),
  media_url: Joi.string().allow(null, '').optional(),
  media_alt: Joi.string().min(1).allow(null, '').optional(),
  is_published: Joi.boolean().optional(),
  materials: Joi.array().items(Joi.object({
    name: Joi.string().min(1).required(),
    quantity: Joi.number().integer().min(1).optional()
  })).optional(),
  steps: Joi.array().items(Joi.object({
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    media_url: Joi.string().allow(null, '').optional(),
    media_alt: Joi.string().min(1).allow(null, '').optional()
  })).optional()
});


// Schéma pour la création d'une catégorie
export const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.empty': 'Le nom de la catégorie ne peut pas être vide.',
    'string.min': 'Le nom de la catégorie doit contenir au moins 3 caractères.',
    'string.max': 'Le nom de la catégorie ne doit pas dépasser 30 caractères.',
    'any.required': 'Le nom de la catégorie est obligatoire.',
  }),
  description: Joi.string().min(3).max(500).optional().allow(null, '').messages({
    'string.min': 'La description doit contenir au moins 3 caractères.',
    'string.max': 'La description ne doit pas dépasser 500 caractères.',
  })
});

// Schéma pour la modification d'une catégorie
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.empty': 'Le nom de la catégorie ne peut pas être vide.',
    'string.min': 'Le nom de la catégorie doit contenir au moins 3 caractères.',
    'string.max': 'Le nom de la catégorie ne doit pas dépasser 30 caractères.',
    'any.required': 'Le nom de la catégorie est obligatoire.',
  }),
  description: Joi.string().min(3).max(500).optional().allow(null, '').messages({
    'string.min': 'La description doit contenir au moins 3 caractères.',
    'string.max': 'La description ne doit pas dépasser 500 caractères.',
  })
});

// Schéma pour l'envoi d'un message
export const messageSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Le titre du message ne peut pas être vide.',
    'string.min': 'Le message doit contenir au moins 3 caractères.',
    'string.max': 'Le titre du message ne doit pas dépasser 255 caractères.',
    'any.required': 'Le titre du message est obligatoire.',
  }),
  text: Joi.string().min(3).required().messages({
    'string.empty': 'Le contenu du message est requis.',
    'string.min': 'Le contenu du message doit contenir au moins 3 caractères.',
    'any.required': 'Le contenu du message est obligatoire.',
  })
});

// Schéma pour les responses
export const responseSchema = Joi.object({
  text: Joi.string().min(3).required().messages({
    'string.empty': 'La réponse est requise.',
    'string.min': 'La réponse doit contenir au moins 3 caractères.',
    'any.required': 'La réponse est obligatoire.',
  })
});


// ------------------------- Test des fonctions -------------------------
/*
const utilisateur = {
  pseudo: "Jes",
  mail: "jeanexample.com",
  password: "scv"
};
const testUser = userSchema.validate(utilisateur);
if (testUser.error) {
  console.log("Erreur userSchema :", testUser.error.details[0].message);
} else {
  console.log("Données inscription valides !");
}

const lesson = {
  name: "Perceuse mur",
  materials: "Perceuse, vis",
  steps: "1. Percez. 2. Vissez."
};
const testLesson = lessonSchema.validate(lesson);
if (testLesson.error) {
  console.log("Erreur lessonSchema :", testLesson.error.details[0].message);
} else {
  console.log("Données leçon valides !");
}

const category = {
  name: "Décoration",
};
const testCategory = categorySchema.validate(category);
if (testCategory.error) {
  console.log("Erreur categorySchema :", testCategory.error.details[0].message);
} else {
  console.log("Données catégorie valides !");
}

const message = {
  name: "Décoration",
};
const testMessage = messageSchema.validate(message);
if (testMessage.error) {
  console.log("Erreur messageSchema :", testMessage.error.details[0].message);
} else {
  console.log("Données message valides !");
}

const response = {
  name: "Décoration",
};
const testResponse = responseSchema.validate(response);
if (testResponse.error) {
  console.log("Erreur responseSchema :", testResponse.error.details[0].message);
} else {
  console.log("Données réponse valides !");
}
  */