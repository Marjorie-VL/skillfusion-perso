import { Role, Users, Category, Lesson, Step, Question, Response, Material, sequelize } from "../models/association.js";

// --- ROLES ---
const adminRole = await Role.create({ description: 'Administrateur' });
const instructorRole = await Role.create({ description: 'Instructeur' });
const userRole = await Role.create({ description: 'Utilisateur' });

//PASSWORD = Skillfusion_1
// --- USERS ---
const admin = await Users.create({ pseudo: 'admin', password: '$argon2id$v=19$m=65536,t=3,p=4$U91TV0f9B8IVGc8pzzC5Qg$R8CvY8SjjsIxCZb+St24+rzN0BqrP6PWMXjqUWC0Rik', mail: 'admin@exemple.com', role_id: adminRole.id });
const user1 = await Users.create({ pseudo: 'user1', password: '$argon2id$v=19$m=65536,t=3,p=4$ptnpy1uq70YIZAF7Q0SYsA$EQJ8DMg2aSpYwMDwGnklFbeiZzM9cJRSqTNQ10LI8Ps', mail: 'user1@exemple.com', role_id: userRole.id });
const user2 = await Users.create({ pseudo: 'user2', password: '$argon2id$v=19$m=65536,t=3,p=4$L8HqSby5OGn2s3pk7DQNpA$KAYO0EW0Qbvl5DRKjCnm+FNtltHsioaJG4IySY+4apM', mail: 'user2@exemple.com', role_id: userRole.id });
const instructor = await Users.create({ pseudo: 'instructor', password: '$argon2id$v=19$m=65536,t=3,p=4$1WCKagO6UKc79Sj+KM1tuw$EmPwjcckU8lXi/5EyDzEkvpXYxxXRtXVqQ+/Ov6AHXs', mail: 'instructor@exemple.com', role_id: instructorRole.id });

// --- CATEGORIES ---
const catMaconnerie = await Category.create({ name: 'Maçonnerie' });
const catPeinture = await Category.create({ name: 'Peinture' });
const catElectricite = await Category.create({ name: 'Électricité' });
const catAutre = await Category.create({ name: 'Autres' });

// --- LESSONS ---
const lesson1 = await Lesson.create({
  name: 'Réparer une fissure dans un mur extérieur',
  text: 'Contenu de la leçon sur la réparation de fissure...',
  media: '1111-scie-a-bois.jpg',
  category_id: catMaconnerie.id,
  users_id: admin.id,
});

const lesson2 = await Lesson.create({
  name: 'Monter un petit muret en parpaings',
  text: 'Contenu de la leçon sur le montage de muret...',
  media: '1112-poncer-du-bois.jpg',
  category_id: catMaconnerie.id,
  users_id: instructor.id
});

const lesson3 = await Lesson.create({
  name: 'Poser un seuil de porte en béton',
  text: 'Contenu de la leçon sur la pose de seuil...',
  media: '1113-perceuse-a-bois.jpg',
  category_id: catMaconnerie.id,
  users_id: admin.id
});

const lesson4 = await Lesson.create({
  name: 'Peindre des pots de fleurs ou bocaux en verre',
  text: 'Contenu de la leçon sur la peinture de pots...',
  media: '1114-assemblage-par-vissage.jpg',
  category_id: catPeinture.id,
  users_id: user1.id
});

const lesson5 = await Lesson.create({
  name: 'Repeindre un cadre, miroir ou objet déco',
  text: 'Contenu de la leçon sur la repeinte de cadre...',
  media: '1115-mur-en-maconnerie.jpg',
  category_id: catPeinture.id,
  users_id: admin.id
});

// --- STEPS ---
const step1 = await Step.create({ step_order: 1, title: 'Préparation de la fissure', description: 'Commencez par brosser la fissure pour enlever les poussières, mousses ou saletés. Si la fissure est fine, élargissez-la légèrement avec un petit burin ou tournevis, pour que l’enduit accroche mieux. Nettoyez ensuite avec une éponge humide pour retirer les résidus.', media: '1111-scie-a-bois.jpg', lesson_id: lesson1.id });
const step2 = await Step.create({ step_order: 2, title: 'Application de l’enduit', description: 'Appliquez l’enduit avec une spatule ou un couteau à enduire, en remplissant bien la fissure. Lissez la surface pour qu’elle soit bien uniforme avec le reste du mur. Laissez sécher complètement (se référer au temps indiqué sur le produit).', media: '1112-poncer-du-bois.jpg', lesson_id: lesson1.id });
const step3 = await Step.create({ step_order: 3, title: 'Finition', description: "Une fois sec, vous pouvez poncer légèrement si nécessaire. Appliquez une couche de peinture extérieure pour uniformiser la réparation avec le reste du mur (facultatif mais recommandé)" , media: '1113-perceuse-a-bois.jpg', lesson_id: lesson1.id });
const step4 = await Step.create({ step_order: 1, title: 'Préparer le sol', description: 'Tracez l’emplacement du muret au sol avec un cordeau ou une ligne droite. Creusez une tranchée de 20 à 30 cm de profondeur pour faire une base stable. Remplissez de béton (dosé à 300 kg/m³), laisse sécher 24h.', media: '1114-assemblage-par-vissage.jpg', lesson_id: lesson2.id });
const step5 = await Step.create({ step_order: 2, title: 'Préparer le mortier', description: 'Mélange 1 volume de ciment pour 4 volumes de sable, avec de l’eau. Le mortier doit être onctueux mais pas liquide.', media: '1115-mur-en-maconnerie.jpg', lesson_id: lesson2.id });
const step6 = await Step.create({ step_order: 3, title: 'Poser la première rangée', description: 'Étalez une couche de mortier sur la base. Continuez la rangée en posant les parpaings bord à bord avec 1 cm de joint', media: '1116-coupe-de-carrelage.jpg',lesson_id: lesson3.id });
const step7 = await Step.create({ step_order: 1, title: 'Préparer l’emplacement', description: 'Décalez les parpaings d’une demi-longueur à chaque rangée pour la solidité (pose en quinconce). Contrôlez régulièrement le niveau horizontal et vertical avec un niveau à bulle et un fil à plomb.', media: '1117-plafonnier-dans-plaque-platre.jpg',lesson_id: lesson3.id });
const step8 = await Step.create({ step_order: 2, title: 'Installer le coffrage', description: 'Découpez et vissez les planches pour former un moule rectangulaire aux bonnes dimensions. Vérifiez que le coffrage est bien stable et de niveau. Huilez l’intérieur pour faciliter le démoulage.', media: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', lesson_id: lesson4.id });
const step9 = await Step.create({ step_order: 3, title: 'Préparer et couler le béton', description: 'Préparez le béton (1 volume de ciment, 2 de sable, 3 de gravier + eau). Versez le béton dans le coffrage, en couches et en tassant bien à chaque fois. Utilisez une truelle ou une règle pour lisser la surface.', media: '1119-reussir-pose-carrelage.jpg', lesson_id: lesson5.id });

// --- MATERIAL ---
await Material.create({  name: 'Brosse métallique', lesson_id: lesson1.id });
await Material.create({  name: 'Enduit de rebouchage', lesson_id: lesson2.id });
await Material.create({  name: 'Peinture façade', lesson_id: lesson3.id });

// --- QUESTIONS ---
const question1 = await Question.create({ title:'fissures', text: 'Comment bien préparer la surface avant de réparer une fissure ?', users_id: admin.id });
const question2 = await Question.create({ title:'muret', text: 'Quel type de mortier utiliser pour monter un muret ?', users_id: user1.id });

// --- REPONSES ---
await Response.create({  text: 'Il faut brosser la fissure et l\'humidifer.', question_id: question1.id, users_id: user2.id });
await Response.create({  text: 'Utiliser un mortier de type N.', question_id: question2.id, users_id: admin.id });

// --- USERS_HAS_FAVORITES ---
await sequelize.query(
  `INSERT INTO users_has_favorites (users_id, lesson_id)
  VALUES 
    (${user1.id}, ${lesson1.id}),
    (${user1.id}, ${lesson3.id}),
    (${user2.id}, ${lesson2.id})
    `,
);

console.log(`✅ Données de test insérées!`);