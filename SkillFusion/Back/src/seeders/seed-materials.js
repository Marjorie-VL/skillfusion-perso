import { Lesson, Material } from "../models/association.js";

async function findLessonByTitleOrThrow(title) {
  const lesson = await Lesson.findOne({ where: { title } });
  if (!lesson) {
    throw new Error(`Leçon introuvable: ${title}. Exécute d'abord seed-lessons.`);
  }
  return lesson;
}

async function ensureMaterial(lesson_id, name, quantity) {
  const existing = await Material.findOne({ where: { lesson_id, name } });
  if (existing) {
    console.log(`✔️ Existe matériel: ${name} pour lesson_id=${lesson_id}`);
    return existing;
  }
  const created = await Material.create({ lesson_id, name, quantity });
  console.log(`➕ Créé matériel: ${name} pour lesson_id=${lesson_id}`);
  return created;
}

async function seedMaterials() {
  const l1 = await findLessonByTitleOrThrow('Réparer une fissure dans un mur extérieur');
  const l2 = await findLessonByTitleOrThrow('Monter un petit muret en parpaings');
  const l3 = await findLessonByTitleOrThrow('Poser un seuil de porte en béton');
  const l4 = await findLessonByTitleOrThrow('Peindre des pots de fleurs ou bocaux en verre');
  const l5 = await findLessonByTitleOrThrow('Repeindre un cadre, miroir ou objet déco');

  // Leçon 1: Réparer une fissure dans un mur extérieur
  await ensureMaterial(l1.id, 'Brosse métallique', 1);
  await ensureMaterial(l1.id, 'Enduit de rebouchage extérieur', 1);
  await ensureMaterial(l1.id, 'Éponge humide', 1);
  await ensureMaterial(l1.id, 'Petit burin ou tournevis', 1);

  // Leçon 2: Monter un petit muret en parpaings
  await ensureMaterial(l2.id, 'Parpaings', 20);
  await ensureMaterial(l2.id, 'Ciment', 1);
  await ensureMaterial(l2.id, 'Sable', 3);
  await ensureMaterial(l2.id, 'Niveau à bulle', 1);

  // Leçon 3: Poser un seuil de porte en béton
  await ensureMaterial(l3.id, 'Planches de coffrage', 4);
  await ensureMaterial(l3.id, 'Ciment', 1);
  await ensureMaterial(l3.id, 'Sable', 2);
  await ensureMaterial(l3.id, 'Gravier', 3);
  await ensureMaterial(l3.id, 'Huile de démoulage', 1);

  // Leçon 4: Peindre des pots de fleurs ou bocaux en verre
  await ensureMaterial(l4.id, 'Pots de fleurs ou bocaux en verre', 3);
  await ensureMaterial(l4.id, 'Peinture acrylique', 2);
  await ensureMaterial(l4.id, 'Pinceaux de différentes tailles', 3);
  await ensureMaterial(l4.id, 'Papier de verre fin', 1);

  // Leçon 5: Repeindre un cadre, miroir ou objet déco
  await ensureMaterial(l5.id, 'Peinture adaptée au support', 1);
  await ensureMaterial(l5.id, 'Pinceaux fins', 2);
  await ensureMaterial(l5.id, 'Papier de verre', 1);
  await ensureMaterial(l5.id, 'Primer d\'accrochage', 1);
}

seedMaterials()
  .then(() => {
    console.log('✅ Seed materials terminé.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed materials échoué:', err);
    process.exit(1);
  });


