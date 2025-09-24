import { Lesson, Category, User } from "../models/association.js";

async function findByNameOrThrow(model, where) {
  const entity = await model.findOne({ where });
  if (!entity) {
    throw new Error(`${model.name} introuvable pour ${JSON.stringify(where)}. Assure-toi d'avoir seedé rôles/utilisateurs/catégories.`);
  }
  return entity;
}

async function seedLessons() {
  // Pré-requis: seed-roles, seed-users, seed-categories
  const admin = await findByNameOrThrow(User, { email: "admin@exemple.com" });
  const instructor = await findByNameOrThrow(User, { email: "instructor@exemple.com" });
  const user1 = await findByNameOrThrow(User, { email: "user1@exemple.com" });

  const catMaconnerie = await findByNameOrThrow(Category, { name: "Maçonnerie" });
  const catPeinture = await findByNameOrThrow(Category, { name: "Peinture" });

  const lessons = [
    {
      title: 'Réparer une fissure dans un mur extérieur',
      description: 'Contenu de la leçon sur la réparation de fissure...',
      is_published: true,
      media_url: '1111-scie-a-bois.jpg',
      media_alt: 'scie-a-bois',
      category_id: catMaconnerie.id,
      user_id: admin.id,
    },
    {
      title: 'Monter un petit muret en parpaings',
      description: 'Contenu de la leçon sur le montage de muret...',
      is_published: true,
      media_url: '1112-poncer-du-bois.jpg',
      media_alt: 'poncer-du-bois',
      category_id: catMaconnerie.id,
      user_id: instructor.id,
    },
    {
      title: 'Poser un seuil de porte en béton',
      description: 'Contenu de la leçon sur la pose de seuil...',
      is_published: true,
      media_url: '1113-perceuse-a-bois.jpg',
      media_alt: 'perceuse-a-bois',
      category_id: catMaconnerie.id,
      user_id: instructor.id,
    },
    {
      title: 'Peindre des pots de fleurs ou bocaux en verre',
      description: 'Contenu de la leçon sur la peinture de pots...',
      is_published: true,
      media_url: '1114-assemblage-par-vissage.jpg',
      media_alt: 'assemblage-par-vissage',
      category_id: catPeinture.id,
      user_id: instructor.id,
    },
    {
      title: 'Repeindre un cadre, miroir ou objet déco',
      description: 'Contenu de la leçon sur la repeinte de cadre...',
      is_published: true,
      media_url: '1115-mur-en-maconnerie.jpg',
      media_alt: 'mur-en-maconnerie',
      category_id: catPeinture.id,
      user_id: instructor.id,
    }
  ];

  for (const payload of lessons) {
    const existing = await Lesson.findOne({ where: { title: payload.title } });
    if (existing) {
      console.log(`✔️ Existe leçon: ${existing.title} (id=${existing.id})`);
      continue;
    }
    await Lesson.create(payload);
    console.log(`➕ Créée leçon: ${payload.title}`);
  }
}

seedLessons()
  .then(() => {
    console.log("✅ Seed leçons terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed leçons échoué:", err);
    process.exit(1);
  });


