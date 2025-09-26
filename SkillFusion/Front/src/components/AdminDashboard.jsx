import React, { useState } from "react";
import { toast } from "react-toastify";

export default function AdminDashboard({ usersData }) {
  const [users, setUsers] = useState(usersData);

  // Fonction pour obtenir le nom du rôle
  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return "Administrateur";
      case 2: return "Instructeur";
      case 3: return "Utilisateur";
      default: return "Inconnu";
    }
  };

  // Fonction pour supprimer un utilisateur (exemple)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Mise à jour locale de la liste des utilisateurs
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  // Fonction pour changer le rôle d'un utilisateur (exemple)
  const handleChangeRole = async (userId, newRoleId) => {
    try {
      // Récupérer l'utilisateur avant la modification pour le message
      const user = users.find(u => u.id === userId);
      const oldRoleName = getRoleName(user.role_id);
      const newRoleName = getRoleName(newRoleId);

      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du rôle");

      // Mise à jour locale
      setUsers(users.map(user => user.id === userId ? { ...user, role_id: newRoleId } : user));
      
      // Toast de succès avec message détaillé
      toast.success(`L'utilisateur "${user.user_name}" est passé du rôle "${oldRoleName}" à "${newRoleName}"`);
    } catch (error) {
      console.error("❌ Erreur modification rôle →", error.message);
      toast.error("Erreur lors de la modification du rôle : " + error.message);
    }
  };

  return (
    <section>
      <h2>Gestion des utilisateurs</h2>
      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #ccc" }}>
                <div className="accountList__detail">
                  <td>{user.user_name.replace(/^./, (match) => match.toUpperCase())}</td>
                  <td className="accountList__detail__name">{user.email}</td>
                  <td>
                    <select
                      value={user.role_id}
                      onChange={(e) => handleChangeRole(user.id, parseInt(e.target.value))}
                    >
                      <option value={1}>Administrateur</option>
                      <option value={2}>Instructeur</option>
                      <option value={3}>Utilisateur</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                    >
                      Supprimer
                    </button>
                  </td>
                </div>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
