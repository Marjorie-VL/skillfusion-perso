import { Role } from "../models/association.js";

async function seedRoles() {
  const roleNames = ["Administrateur", "Instructeur", "Utilisateur"];

  for (const name of roleNames) {
    const [role, created] = await Role.findOrCreate({
      where: { name },
      defaults: { name },
    });
    console.log(`${created ? "➕ Créé" : "✔️ Existe"} rôle: ${role.name} (id=${role.id})`);
  }
}

seedRoles()
  .then(() => {
    console.log("✅ Seed rôles terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed rôles échoué:", err);
    process.exit(1);
  });


