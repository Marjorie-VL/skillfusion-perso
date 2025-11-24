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

  // Leçon 1: Réparer une fissure dans un mur extérieur (4 étapes)
  await ensureStep(l1.id, 1, { 
    title: 'Préparation de la fissure', 
    description: 'Commencez par brosser la fissure pour enlever les poussières, mousses ou saletés. Si la fissure est fine, élargissez-la légèrement avec un petit burin ou tournevis, pour que l\'enduit accroche mieux. Nettoyez ensuite avec une éponge humide pour retirer les résidus.', 
    media_url: '1111-scie-a-bois.jpg', 
    media_alt: 'scie-a-bois' 
  });
  await ensureStep(l1.id, 2, { 
    title: "Application de l'enduit", 
    description: "Appliquez l'enduit de rebouchage avec une truelle, en le tassant bien dans la fissure. Veillez à remplir complètement la fissure et à dépasser légèrement pour compenser le retrait au séchage. Lissez la surface avec la truelle.", 
    media_url: '1112-poncer-du-bois.jpg', 
    media_alt: 'poncer-du-bois' 
  });
  await ensureStep(l1.id, 3, { 
    title: 'Séchage et ponçage', 
    description: 'Laissez sécher complètement selon les indications du fabricant (généralement 24 à 48 heures). Une fois sec, poncez légèrement la surface avec du papier de verre fin pour obtenir une surface lisse et uniforme.', 
    media_url: '1113-perceuse-a-bois.jpg', 
    media_alt: 'perceuse-a-bois' 
  });
  await ensureStep(l1.id, 4, { 
    title: 'Finition et protection', 
    description: 'Appliquez une couche de peinture ou d\'enduit de finition pour protéger la réparation et harmoniser l\'aspect avec le reste du mur. Laissez sécher avant d\'appliquer une deuxième couche si nécessaire.', 
    media_url: '1114-assemblage-par-vissage.jpg', 
    media_alt: 'assemblage-par-vissage' 
  });

  // Leçon 2: Monter un petit muret en parpaings (5 étapes)
  await ensureStep(l2.id, 1, { 
    title: 'Préparer le sol', 
    description: 'Tracez l\'emplacement du muret au sol avec des piquets et un cordeau. Creusez une tranchée d\'environ 20 cm de profondeur et 40 cm de largeur. Nivelez le fond avec du sable et compactez-le.', 
    media_url: '1114-assemblage-par-vissage.jpg', 
    media_alt: 'assemblage-par-vissage' 
  });
  await ensureStep(l2.id, 2, { 
    title: 'Préparer le mortier', 
    description: 'Mélangez 1 volume de ciment pour 3 volumes de sable, puis ajoutez de l\'eau progressivement jusqu\'à obtenir une consistance crémeuse. Le mortier doit être homogène et sans grumeaux.', 
    media_url: '1115-mur-en-maconnerie.jpg', 
    media_alt: 'mur-en-maconnerie' 
  });
  await ensureStep(l2.id, 3, { 
    title: 'Poser la première rangée', 
    description: 'Étalez une couche de mortier sur la base. Posez le premier parpaing en l\'alignant avec le cordeau. Continuez la rangée en posant les parpaings bord à bord avec 1 cm de joint entre eux. Vérifiez le niveau horizontal.', 
    media_url: '1116-coupe-de-carrelage.jpg', 
    media_alt: 'coupe-de-carrelage' 
  });
  await ensureStep(l2.id, 4, { 
    title: 'Monter les rangées suivantes', 
    description: 'Décalez les parpaings d\'une demi-longueur à chaque rangée pour la solidité (pose en quinconce). Contrôlez régulièrement le niveau horizontal et vertical avec un niveau à bulle et un fil à plomb.', 
    media_url: '1117-plafonnier-dans-plaque-platre.jpg', 
    media_alt: 'plafonnier-dans-plaque-platre' 
  });
  await ensureStep(l2.id, 5, { 
    title: 'Finitions', 
    description: 'Une fois le muret terminé, remplissez les joints avec le mortier restant. Lissez les joints avec une truelle pour un rendu propre. Laissez sécher avant de retirer les éventuels résidus de mortier.', 
    media_url: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', 
    media_alt: 'refaire-des-joints-de-carrelage-sur-les-anciens' 
  });

  // Leçon 3: Poser un seuil de porte en béton (4 étapes)
  await ensureStep(l3.id, 1, { 
    title: 'Préparer l\'emplacement', 
    description: 'Mesurez l\'ouverture de la porte et marquez les dimensions nécessaires. Nettoyez l\'emplacement en enlevant les anciens matériaux et en préparant une base stable et de niveau.', 
    media_url: '1117-plafonnier-dans-plaque-platre.jpg', 
    media_alt: 'plafonnier-dans-plaque-platre' 
  });
  await ensureStep(l3.id, 2, { 
    title: 'Installer le coffrage', 
    description: 'Découpez et vissez les planches pour former un moule rectangulaire aux bonnes dimensions. Vérifiez que le coffrage est bien stable et de niveau. Huilez l\'intérieur pour faciliter le démoulage.', 
    media_url: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', 
    media_alt: 'refaire-des-joints-de-carrelage-sur-les-anciens' 
  });
  await ensureStep(l3.id, 3, { 
    title: 'Préparer et couler le béton', 
    description: 'Préparez le béton (1 volume de ciment, 2 de sable, 3 de gravier + eau). Versez le béton dans le coffrage, en couches et en tassant bien à chaque fois. Utilisez une truelle ou une règle pour lisser la surface.', 
    media_url: '1119-reussir-pose-carrelage.jpg', 
    media_alt: 'reussir-pose-carrelage' 
  });
  await ensureStep(l3.id, 4, { 
    title: 'Séchage et démoulage', 
    description: 'Laissez sécher le béton pendant au moins 24 à 48 heures selon les conditions climatiques. Retirez délicatement le coffrage une fois le béton suffisamment dur. Laissez sécher complètement avant d\'utiliser le seuil.', 
    media_url: '1111-scie-a-bois.jpg', 
    media_alt: 'scie-a-bois' 
  });

  // Leçon 4: Peindre des pots de fleurs ou bocaux en verre (4 étapes)
  await ensureStep(l4.id, 1, { 
    title: 'Préparation des supports', 
    description: 'Nettoyez soigneusement les pots ou bocaux avec de l\'eau savonneuse pour enlever toute trace de graisse ou de saleté. Si nécessaire, poncez légèrement la surface avec du papier de verre fin pour améliorer l\'adhérence.', 
    media_url: '1112-poncer-du-bois.jpg', 
    media_alt: 'poncer-du-bois' 
  });
  await ensureStep(l4.id, 2, { 
    title: 'Application de la première couche', 
    description: 'Appliquez une première couche de peinture acrylique en utilisant un pinceau adapté. Pour les pots en terre cuite, commencez par l\'intérieur si nécessaire. Laissez sécher complètement avant de continuer.', 
    media_url: '1113-perceuse-a-bois.jpg', 
    media_alt: 'perceuse-a-bois' 
  });
  await ensureStep(l4.id, 3, { 
    title: 'Application de la deuxième couche', 
    description: 'Appliquez une deuxième couche de peinture pour obtenir une couverture uniforme et opaque. Veillez à bien étaler la peinture pour éviter les traces de pinceau. Laissez sécher entre les couches.', 
    media_url: '1114-assemblage-par-vissage.jpg', 
    media_alt: 'assemblage-par-vissage' 
  });
  await ensureStep(l4.id, 4, { 
    title: 'Finition et protection', 
    description: 'Une fois la peinture sèche, vous pouvez appliquer une couche de vernis protecteur si les pots sont destinés à l\'extérieur. Laissez sécher complètement avant d\'utiliser les pots.', 
    media_url: '1115-mur-en-maconnerie.jpg', 
    media_alt: 'mur-en-maconnerie' 
  });

  // Leçon 5: Repeindre un cadre, miroir ou objet déco (4 étapes)
  await ensureStep(l5.id, 1, { 
    title: 'Préparation de la surface', 
    description: 'Retirez l\'ancienne peinture si elle s\'écaille, ou poncez-la légèrement avec du papier de verre pour créer une surface rugueuse qui permettra à la nouvelle peinture d\'adhérer. Nettoyez la surface avec un chiffon humide.', 
    media_url: '1116-coupe-de-carrelage.jpg', 
    media_alt: 'coupe-de-carrelage' 
  });
  await ensureStep(l5.id, 2, { 
    title: 'Application du primer', 
    description: 'Appliquez une couche de primer d\'accrochage si nécessaire, surtout pour les surfaces lisses comme le verre ou le métal. Laissez sécher complètement selon les indications du fabricant.', 
    media_url: '1117-plafonnier-dans-plaque-platre.jpg', 
    media_alt: 'plafonnier-dans-plaque-platre' 
  });
  await ensureStep(l5.id, 3, { 
    title: 'Application de la peinture', 
    description: 'Appliquez la peinture avec des pinceaux fins pour un travail précis. Commencez par les zones difficiles d\'accès, puis peignez le reste. Appliquez plusieurs couches fines plutôt qu\'une seule couche épaisse.', 
    media_url: '1118-refaire-des-joints-de-carrelage-sur-les-anciens.jpg', 
    media_alt: 'refaire-des-joints-de-carrelage-sur-les-anciens' 
  });
  await ensureStep(l5.id, 4, { 
    title: 'Séchage et finition', 
    description: 'Laissez sécher complètement entre chaque couche. Une fois la dernière couche sèche, vous pouvez appliquer un vernis de protection si nécessaire. Replacez le verre ou le miroir une fois tout sec.', 
    media_url: '1119-reussir-pose-carrelage.jpg', 
    media_alt: 'reussir-pose-carrelage' 
  });
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


