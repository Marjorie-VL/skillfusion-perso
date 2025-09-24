import { Topic, User } from "../models/association.js";

async function seedTopics() {
  // Récupération des utilisateurs nécessaires
  const admin = await User.findOne({ where: { email: "admin@exemple.com" } });
  const user1 = await User.findOne({ where: { email: "user1@exemple.com" } });

  if (!admin || !user1) {
    throw new Error("Les utilisateurs admin ou user1 n'existent pas. Exécute d'abord seed-users.");
  }

  const topics = [
    { title: "fissures", content: "Comment bien préparer la surface avant de réparer une fissure ?", user_id: admin.id },
    { title: "muret", content: "Quel type de mortier utiliser pour monter un muret ?", user_id: user1.id },
  ];

  for (const t of topics) {
    const existing = await Topic.findOne({ where: { title: t.title } });
    if (existing) {
      console.log(`✔️ Existe topic: ${existing.title} (id=${existing.id})`);
      continue;
    }
    await Topic.create(t);
    console.log(`➕ Créé topic: ${t.title}`);
  }
}

seedTopics()
  .then(() => {
    console.log("✅ Seed topics terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed topics échoué:", err);
    process.exit(1);
  });
