import React from "react";
import { useAuth } from "../services/api.jsx";
import UserDashboard from "./UserDashboard.jsx";
import InstructorDashboard from "./InstructorDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  // Rediriger vers le bon tableau de bord selon le rôle
  switch (user.role_id) {
    case 1: // Administrateur
      return <AdminDashboard usersData={[]} />; // Les données seront chargées dans AdminDashboard
    case 2: // Instructeur
      return <InstructorDashboard />;
    case 3: // Utilisateur
      return <UserDashboard />;
    default:
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Rôle non reconnu. Veuillez contacter l'administrateur.</p>
        </div>
      );
  }
}
