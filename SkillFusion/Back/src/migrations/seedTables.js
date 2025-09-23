import { Role, User, Category, Lesson, Step, Topic, Reply, Material, sequelize } from "../models/association.js";

// --- ROLES ---
const adminRole = await Role.create({ name: 'Administrateur' });
const instructorRole = await Role.create({ name: 'Instructeur' });
const userRole = await Role.create({ name: 'Utilisateur' });

//PASSWORD = Skillfusion_1
// --- USER ---
const admin = await User.create({ user_name: 'admin', password: '$argon2id$v=19$m=65536,t=3,p=4$U91TV0f9B8IVGc8pzzC5Qg$R8CvY8SjjsIxCZb+St24+rzN0BqrP6PWMXjqUWC0Rik', email: 'admin@exemple.com', role_id: adminRole.id });
const user1 = await User.create({ user_name: 'user1', password: '$argon2id$v=19$m=65536,t=3,p=4$ptnpy1uq70YIZAF7Q0SYsA$EQJ8DMg2aSpYwMDwGnklFbeiZzM9cJRSqTNQ10LI8Ps', email: 'user1@exemple.com', role_id: userRole.id });
const user2 = await User.create({ user_name: 'user2', password: '$argon2id$v=19$m=65536,t=3,p=4$L8HqSby5OGn2s3pk7DQNpA$KAYO0EW0Qbvl5DRKjCnm+FNtltHsioaJG4IySY+4apM', email: 'user2@exemple.com', role_id: userRole.id });
const instructor = await User.create({ user_name: 'instructor', password: '$argon2id$v=19$m=65536,t=3,p=4$1WCKagO6UKc79Sj+KM1tuw$EmPwjcckU8lXi/5EyDzEkvpXYxxXRtXVqQ+/Ov6AHXs', email: 'instructor@exemple.com', role_id: instructorRole.id });

// --- CATEGORIES ---
const catMaconnerie = await Category.create({ name: 'Maçonnerie' });
const catPeinture = await Category.create({ name: 'Peinture' });
const catElectricite = await Category.create({ name: 'Électricité' });
const catAutre = await Category.create({ name: 'Autres' });

// --- LESSONS ---
const lesson1 = await Lesson.create({
  title: 'Réparer une fissure dans un mur extérieur',
  description: 'Contenu de la leçon sur la réparation de fissure...', 
  is_published: true,
  media_url: '1111-scie-a-bois.jpg',
  media_alt: 'scie-a-bois',
  category_id: catMaconnerie.id,
  user_id: admin.id,
});

const lesson2 = await Lesson.create({
  title: 'Monter un petit muret en parpaings',
  description: 'Contenu de la leçon sur le montage de muret...', 
  is_published: true,
  media_url: '1112-poncer-du-bois.jpg',
  media_alt: 'poncer-du-bois',
  category_id: catMaconnerie.id,
  user_id: instructor.id
});

const lesson3 = await Lesson.create({
  title: 'Poser un seuil de porte en béton',
  description: 'Contenu de la leçon sur la pose de seuil...',
  is_published: true,
  media_url: '1113-perceuse-a-bois.jpg',
  media_alt: 'perceuse-a-bois',
  category_id: catMaconnerie.id,
  user_id: admin.id
});

const lesson4 = await Lesson.create({
  title: 'Peindre des pots de fleurs ou bocaux en verre',
  description: 'Contenu de la leçon sur la peinture de pots...', 
  is_published: true,
  media_url: '1114-assemblage-par-vissage.jpg',
  media_alt: 'assemblage-par-vissage',
  category_id: catPeinture.id,
  user_id: user1.id
});

const lesson5 = await Lesson.create({
  title: 'Repeindre un cadre, miroir ou objet déco',
  description: 'Contenu de la leçon sur la repeinte de cadre...', 
  is_published: true,
  media_url: '1115-mur-en-maconnerie.jpg',
  media_alt: 'mur-en-maconnerie',
  category_id: catPeinture.id,
  user_id: admin.id
});

// --- STEPS ---
const step1 = await Step.create({ step_order: 1, title: 'Préparation de la fissure', description: 'Commencez par brosser la fissure pour enlever les poussières, mousses ou saletés. Si la fissure est fine, élargissez-la légèrement avec un petit burin ou tournevis, pour que l’enduit accroche mieux. Nettoyez ensuite avec une éponge humide pour retirer les résidus.', media_url: '1111-scie-a-bois.jpg', media_alt: 'scie-a-bois', lesson_id: lesson1.id });
const step2 = await Step.create({ step_order: 2, title: 'Application de l’enduit', description: 'Appliquez l’enduit avec une spatule ou un couteau à enduire, en remplissant bien la fissure. Lissez la surface pour qu’elle soit bien uniforme avec le reste du mur. Laissez sécher complètement (se référer au temps indiqué sur le produit).', media_url: '1112-poncer-du-bois.jpg', media_alt: 'poncer-du-bois',     lesson_id: lesson1.id });
const step3 = await Step.create({ step_order: 3, title: 'Finition', description: "Une fois sec, vous pouvez poncer légèrement si nécessaire. Appliquez une couche de peinture extérieure pour uniformiser la réparation avec le reste du mur (facultatif mais recommandé)" , media_url: '1113-perceuse-a-bois.jpg', media_alt: 'perceuse-a-bois', lesson_id: lesson1.id });
const step4 = await Step.create({ step_order: 1, title: 'Préparer le sol', description: 'Tracez l’emplacement du muret au sol avec un cordeau ou une ligne droite. Creusez une tranchée de 20 à 30 cm de profondeur pour faire une base stable. Remplissez de béton (dosé à 300 kg/m³), laisse sécher 24h.', media_url: '1114-assemblage-par-vissage.jpg', media_alt: 'assemblage-par-vissage', lesson_id: lesson2.id });
const step5 = await Step.create({ step_order: 2, title: 'Préparer le mortier', description: 'Mélange 1 volume de ciment pour 4 volumes de sable, avec de l’eau. Le mortier doit être onctueux mais pas liquide.', media_url: '1115-mur-en-maconnerie.jpg', media_alt: 'mur-en-maconnerie', lesson_id: lesson2.id });
const step6 = await Step.create({ step_order: 3, title: 'Poser la première rangée', description: 'Étalez une couche de mortier sur la base. Continuez la rangée en posant les parpaings bord à bord avec 1 cm de joint', media_url: '1116-coupe-de-carrelage.jpg', media_alt: 'coupe-de-carrelage', lesson_id: lesson3.id });
const step7 = await Step.create({ step_order: 1, title: 'Préparer l’emplacement', description: 'Décalez les parpaings d’une demi-longueur à chaque rangée pour la solidité (pose en quinconce). Contrôlez régulièrement le niveau horizontal et vertical avec un niveau à bulle et un fil à plomb.', media_url: '1117-plafonnier-dans-plaque-platre.jpg', media_alt: 'plafonnier-dans-plaque-platre', lesson_id: lesson3.id });
const step8 = await Step.create({ step_order: 2, title: 'Installer le coffrage', description: 'Découpez et vissez les planches pour former un moule rectangulaire aux bonnes dimensions. Vérifiez que le coffrage est bien stable et de niveau. Huilez l’intérieur pour faciliter le démoulage.', media_url: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', media_alt: 'refaire-des-joints-de-carrelage-sur-les-anciens', lesson_id: lesson4.id });
const step9 = await Step.create({ step_order: 3, title: 'Préparer et couler le béton', description: 'Préparez le béton (1 volume de ciment, 2 de sable, 3 de gravier + eau). Versez le béton dans le coffrage, en couches et en tassant bien à chaque fois. Utilisez une truelle ou une règle pour lisser la surface.', media_url: '1119-reussir-pose-carrelage.jpg', media_alt: 'reussir-pose-carrelage', lesson_id: lesson5.id });

// --- MATERIAL ---
await Material.create({  name: 'Brosse métallique', quantity: 1, lesson_id: lesson1.id });
await Material.create({  name: 'Enduit de rebouchage', quantity: 1, lesson_id: lesson2.id });
await Material.create({  name: 'Peinture façade', quantity: 1, lesson_id: lesson3.id });

// --- topic ---
const topic1 = await Topic.create({ title:'fissures', content: 'Comment bien préparer la surface avant de réparer une fissure ?', user_id: admin.id });
const topic2 = await Topic.create({ title:'muret', content: 'Quel type de mortier utiliser pour monter un muret ?', user_id: user1.id });

// --- REPLY ---
await Reply.create({  content: 'Il faut brosser la fissure et l\'humidifer.', topic_id: topic1.id, user_id: user2.id });
await Reply.create({  content: 'Utiliser un mortier de type N.', topic_id: topic2.id, user_id: admin.id });

// --- FAVORITE ---
await sequelize.query(
  `INSERT INTO favorite (user_id, lesson_id)
  VALUES 
    (${user1.id}, ${lesson1.id}),
    (${user1.id}, ${lesson3.id}),
    (${user2.id}, ${lesson2.id})
    `,
);

console.log(`✅ Données de test insérées!`);