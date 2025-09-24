import { Reply, Topic, User } from "../models/association.js";

async function seedReplies() {
  // Récupération des utilisateurs
  const admin = await User.findOne({ where: { email: "admin@exemple.com" } });
  const user2 = await User.findOne({ where: { email: "user2@exemple.com" } });

  // Récupération des topics
  const topic1 = await Topic.findOne({ where: { title: "fissures" } });
  const topic2 = await Topic.findOne({ where: { title: "muret" } });

  if (!admin || !user2 || !topic1 || !topic2) {
    throw new Error("Les utilisateurs ou topics nécessaires n'existent pas. Exécute d'abord seed-users et seed-topics.");
  }

  const replies = [
    { content: "Il faut brosser la fissure et l'humidifer.", topic_id: topic1.id, user_id: user2.id },
    { content: "Utiliser un mortier de type N.", topic_id: topic2.id, user_id: admin.id },
  ];

  for (const r of replies) {
    const existing = await Reply.findOne({ where: { content: r.content, topic_id: r.topic_id, user_id: r.user_id } });
    if (existing) {
      console.log(`✔️ Existe reply: "${existing.content}" (id=${existing.id})`);
      continue;
    }
    await Reply.create(r);
    console.log(`➕ Créé reply: "${r.content}"`);
  }
}

seedReplies()
  .then(() => {
    console.log("✅ Seed replies terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed replies échoué:", err);
    process.exit(1);
  });
