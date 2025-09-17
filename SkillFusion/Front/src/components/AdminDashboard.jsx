import React, { useState } from "react";

export default function AdminDashboard({ usersData }) {
  const [users, setUsers] = useState(usersData);

  // Fonction pour supprimer un utilisateur (exemple)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du rôle");

      // Mise à jour locale
      setUsers(users.map(user => user.id === userId ? { ...user, role_id: newRoleId } : user));
    } catch (error) {
      alert("Erreur lors de la modification : " + error.message);
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
                  <td>{user.pseudo.replace(/^./, (match) => match.toUpperCase())}</td>
                  <td className="accountList__detail__name">{user.mail}</td>
                  <td>
                    <select
                      value={user.role_id}
                      onChange={(e) => handleChangeRole(user.id, parseInt(e.target.value))}
                    >
                      <option value={1}>Administrateur</option>
                      <option value={2}>Instructeur</option>
                      <option value={3}>Utilisateur</option>
                      {/* Ajoute ici les autres rôles si besoin */}
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
