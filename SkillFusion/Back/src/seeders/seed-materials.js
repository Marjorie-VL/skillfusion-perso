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

  await ensureMaterial(l1.id, 'Brosse métallique', 1);
  await ensureMaterial(l2.id, 'Enduit de rebouchage', 1);
  await ensureMaterial(l3.id, 'Peinture façade', 1);
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


