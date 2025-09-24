import { Lesson, Step } from "../models/association.js";

async function findLessonByTitleOrThrow(title) {
  const lesson = await Lesson.findOne({ where: { title } });
  if (!lesson) {
    throw new Error(`Leçon introuvable: ${title}. Exécute d'abord seed-lessons.`);
  }
  return lesson;
}

async function ensureStep(lesson_id, step_order, payload) {
  const existing = await Step.findOne({ where: { lesson_id, step_order } });
  if (existing) {
    console.log(`✔️ Existe étape ${step_order} pour lesson_id=${lesson_id}`);
    return existing;
  }
  const created = await Step.create({ lesson_id, step_order, ...payload });
  console.log(`➕ Créée étape ${step_order} pour lesson_id=${lesson_id}`);
  return created;
}

async function seedSteps() {
  const l1 = await findLessonByTitleOrThrow('Réparer une fissure dans un mur extérieur');
  const l2 = await findLessonByTitleOrThrow('Monter un petit muret en parpaings');
  const l3 = await findLessonByTitleOrThrow('Poser un seuil de porte en béton');
  const l4 = await findLessonByTitleOrThrow('Peindre des pots de fleurs ou bocaux en verre');
  const l5 = await findLessonByTitleOrThrow('Repeindre un cadre, miroir ou objet déco');

  await ensureStep(l1.id, 1, { title: 'Préparation de la fissure', description: 'Commencez par brosser la fissure...', media_url: '1111-scie-a-bois.jpg', media_alt: 'scie-a-bois' });
  await ensureStep(l1.id, 2, { title: "Application de l’enduit", description: "Appliquez l’enduit...", media_url: '1112-poncer-du-bois.jpg', media_alt: 'poncer-du-bois' });
  await ensureStep(l1.id, 3, { title: 'Finition', description: 'Une fois sec...', media_url: '1113-perceuse-a-bois.jpg', media_alt: 'perceuse-a-bois' });

  await ensureStep(l2.id, 1, { title: 'Préparer le sol', description: 'Tracez l’emplacement...', media_url: '1114-assemblage-par-vissage.jpg', media_alt: 'assemblage-par-vissage' });
  await ensureStep(l2.id, 2, { title: 'Préparer le mortier', description: 'Mélange 1 volume...', media_url: '1115-mur-en-maconnerie.jpg', media_alt: 'mur-en-maconnerie' });

  await ensureStep(l3.id, 1, { title: 'Préparer l’emplacement', description: 'Décalez les parpaings...', media_url: '1117-plafonnier-dans-plaque-platre.jpg', media_alt: 'plafonnier-dans-plaque-platre' });
  await ensureStep(l3.id, 2, { title: 'Installer le coffrage', description: 'Découpez et vissez...', media_url: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', media_alt: 'refaire-des-joints-de-carrelage-sur-les-anciens' });

  await ensureStep(l4.id, 3, { title: 'Préparer et couler le béton', description: 'Préparez le béton...', media_url: '1119-reussir-pose-carrelage.jpg', media_alt: 'reussir-pose-carrelage' });
}

seedSteps()
  .then(() => {
    console.log('✅ Seed steps terminé.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed steps échoué:', err);
    process.exit(1);
  });


