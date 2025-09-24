import { Category } from "../models/association.js";

async function seedCategories() {
  const categories = [
    "Maçonnerie",
    "Peinture",
    "Électricité",
    "Autres",
  ];

  for (const name of categories) {
    const [cat, created] = await Category.findOrCreate({
      where: { name },
      defaults: { name },
    });
    console.log(`${created ? "➕ Créée" : "✔️ Existe"} catégorie: ${cat.name} (id=${cat.id})`);
  }
}

seedCategories()
  .then(() => {
    console.log("✅ Seed catégories terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed catégories échoué:", err);
    process.exit(1);
  });


