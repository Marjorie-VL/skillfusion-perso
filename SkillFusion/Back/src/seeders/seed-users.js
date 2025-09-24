import argon2 from "argon2";
import { Role, User } from "../models/association.js";

async function seedUsers() {
  // Récupérer les rôles par nom (idempotent, on ne suppose pas id=1,2,3)
  const adminRole = await Role.findOne({ where: { name: "Administrateur" } });
  const instructorRole = await Role.findOne({ where: { name: "Instructeur" } });
  const userRole = await Role.findOne({ where: { name: "Utilisateur" } });

  if (!adminRole || !instructorRole || !userRole) {
    throw new Error("Les rôles n'existent pas. Exécute d'abord seed-roles.");
  }

  const users = [
    { user_name: "admin", email: "admin@exemple.com", role_id: adminRole.id, passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$U91TV0f9B8IVGc8pzzC5Qg$R8CvY8SjjsIxCZb+St24+rzN0BqrP6PWMXjqUWC0Rik" },
    { user_name: "user1", email: "user1@exemple.com", role_id: userRole.id, passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$ptnpy1uq70YIZAF7Q0SYsA$EQJ8DMg2aSpYwMDwGnklFbeiZzM9cJRSqTNQ10LI8Ps" },
    { user_name: "user2", email: "user2@exemple.com", role_id: userRole.id, passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$L8HqSby5OGn2s3pk7DQNpA$KAYO0EW0Qbvl5DRKjCnm+FNtltHsioaJG4IySY+4apM" },
    { user_name: "instructor", email: "instructor@exemple.com", role_id: instructorRole.id, passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$1WCKagO6UKc79Sj+KM1tuw$EmPwjcckU8lXi/5EyDzEkvpXYxxXRtXVqQ+/Ov6AHXs" },
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      console.log(`✔️ Existe utilisateur: ${existing.email} (id=${existing.id})`);
      continue;
    }
    await User.create({ user_name: u.user_name, email: u.email, password: u.passwordHash, role_id: u.role_id });
    console.log(`➕ Créé utilisateur: ${u.email}`);
  }
}

seedUsers()
  .then(() => {
    console.log("✅ Seed users terminé.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed users échoué:", err);
    process.exit(1);
  });


