import { sequelize, User, Lesson } from "../models/association.js";

async function seedFavorites() {
  const user1 = await User.findOne({ where: { email: 'user1@exemple.com' } });
  const user2 = await User.findOne({ where: { email: 'user2@exemple.com' } });
  const l1 = await Lesson.findOne({ where: { title: 'Réparer une fissure dans un mur extérieur' } });
  const l2 = await Lesson.findOne({ where: { title: 'Monter un petit muret en parpaings' } });
  const l3 = await Lesson.findOne({ where: { title: 'Poser un seuil de porte en béton' } });

  if (!user1 || !user2 || !l1 || !l2 || !l3) {
    throw new Error("Pré-requis seed users et lessons non satisfaits.");
  }

  // Idempotence sur table de jointure: on insère si l'association n'existe pas
  const inserts = [
    [user1.id, l1.id],
    [user1.id, l3.id],
    [user2.id, l2.id],
  ];

  for (const [userId, lessonId] of inserts) {
    const [result] = await sequelize.query(
      `INSERT INTO favorite (user_id, lesson_id)
       SELECT :userId, :lessonId
       WHERE NOT EXISTS (
         SELECT 1 FROM favorite WHERE user_id = :userId AND lesson_id = :lessonId
       )`,
      { replacements: { userId, lessonId } }
    );
    console.log(`✔️ Favori assuré user=${userId} lesson=${lessonId}`);
  }
}

seedFavorites()
  .then(() => { console.log('✅ Seed favorites terminé.'); process.exit(0); })
  .catch((err) => { console.error('❌ Seed favorites échoué:', err); process.exit(1); });


