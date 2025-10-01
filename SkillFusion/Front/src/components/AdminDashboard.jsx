import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";

export default function AdminDashboard({ usersData }) {
  const { user } = useAuth();
  const [users, setUsers] = useState(usersData);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Séparer les cours publiés et brouillons
  const publishedLessons = allLessons.filter(lesson => lesson.is_published);
  const draftLessons = allLessons.filter(lesson => !lesson.is_published);

  // Synchroniser usersData avec l'état local
  useEffect(() => {
    setUsers(usersData || []);
  }, [usersData]);

  // Charger tous les cours (publiés + brouillons) pour l'admin
  useEffect(() => {
    const fetchAllLessons = async () => {
      try {
        // Pour l'admin, on récupère tous les cours (publiés + brouillons)
        // On utilise un paramètre spécial pour forcer l'inclusion des brouillons
        console.log('🔍 AdminDashboard - Fetching all lessons with drafts...');
        const data = await lessonService.getAllLessons({ include_drafts: true });
        console.log('🔍 AdminDashboard - Received lessons:', data);
        console.log('🔍 AdminDashboard - Lessons details:', data?.map(l => ({ id: l.id, title: l.title, is_published: l.is_published })));
        setAllLessons(data || []);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
        toast.error("Erreur lors du chargement des cours");
      } finally {
        setLoading(false);
      }
    };

    fetchAllLessons();
  }, []);

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

  // Fonction pour changer le rôle d'un utilisateur
  const handleChangeRole = async (userId, newRoleId) => {
    try {
      // Récupérer l'utilisateur avant la modification pour le message
      const targetUser = users.find(u => u.id === userId);
      const oldRoleName = getRoleName(targetUser.role_id);
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
      toast.success(`L'utilisateur "${targetUser.user_name}" est passé du rôle "${oldRoleName}" à "${newRoleName}"`);
    } catch (error) {
      console.error("❌ Erreur modification rôle →", error.message);
      toast.error("Erreur lors de la modification du rôle : " + error.message);
    }
  };

  // Fonction pour supprimer un cours
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression du cours");

      // Mise à jour locale
      setAllLessons(allLessons.filter((lesson) => lesson.id !== lessonId));
      toast.success("Cours supprimé avec succès !");
    } catch (error) {
      console.error("❌ Erreur suppression cours →", error.message);
      toast.error("Erreur lors de la suppression du cours : " + error.message);
    }
  };

  // Fonction pour publier/dépublier un cours
  const handleTogglePublish = async (lessonId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: !currentStatus }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du statut");

      // Mise à jour locale
      setAllLessons(allLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ));
      toast.success(`Cours ${!currentStatus ? 'publié' : 'mis en brouillon'} !`);
    } catch (error) {
      console.error("❌ Erreur modification statut →", error.message);
      toast.error("Erreur lors de la modification du statut : " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1>Tableau de Bord Administrateur</h1>
      <p>Bienvenue, {user.user_name} ! 👑</p>

      {/* Actions rapides */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Actions rapides</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/new-lesson" className="main-button">
            ➕ Créer un cours
          </Link>
          <Link to="/profil-changes" className="main-button">
            ✏️ Modifier mon profil
          </Link>
          <Link to="/lessons" className="main-button">
            📚 Voir tous les cours
          </Link>
        </div>
      </section>

      {/* Statistiques */}
      <section style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{ 
          backgroundColor: "#e8f5e8", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #4caf50"
        }}>
          <h3 style={{ margin: 0, color: "#2e7d32" }}>{users.length}</h3>
          <p style={{ margin: 0, color: "#2e7d32" }}>Utilisateurs</p>
        </div>
        <div style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #2196f3"
        }}>
          <h3 style={{ margin: 0, color: "#1565c0" }}>{allLessons.length}</h3>
          <p style={{ margin: 0, color: "#1565c0" }}>Total des cours</p>
        </div>
        <div style={{ 
          backgroundColor: "#e8f5e8", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #4caf50"
        }}>
          <h3 style={{ margin: 0, color: "#2e7d32" }}>{allLessons.filter(l => l.is_published).length}</h3>
          <p style={{ margin: 0, color: "#2e7d32" }}>Cours publiés</p>
        </div>
        <div style={{ 
          backgroundColor: "#fff3e0", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #ff9800"
        }}>
          <h3 style={{ margin: 0, color: "#ef6c00" }}>{allLessons.filter(l => !l.is_published).length}</h3>
          <p style={{ margin: 0, color: "#ef6c00" }}>Brouillons</p>
        </div>
      </section>

      {/* Gestion des utilisateurs */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Gestion des utilisateurs 👥</h2>
        {users.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Nom</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Email</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Rôle</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "1rem" }}>
                      {userItem.user_name.replace(/^./, (match) => match.toUpperCase())}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {userItem.email}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select
                        value={userItem.role_id}
                        onChange={(e) => handleChangeRole(userItem.id, parseInt(e.target.value))}
                        style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                      >
                        <option value={1}>Administrateur</option>
                        <option value={2}>Instructeur</option>
                        <option value={3}>Utilisateur</option>
                      </select>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        style={{ 
                          backgroundColor: "#e74c3c", 
                          color: "white", 
                          border: "none", 
                          padding: "0.5rem 1rem", 
                          cursor: "pointer",
                          borderRadius: "4px"
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cours publiés */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Cours publiés 📚</h2>
        {publishedLessons.length === 0 ? (
          <p>Aucun cours publié trouvé.</p>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
            gap: "1rem" 
          }}>
            {publishedLessons.map((lesson) => (
              <div key={lesson.id} style={{ 
                border: `1px solid ${lesson.is_published ? "#4caf50" : "#ff9800"}`, 
                borderRadius: "8px", 
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: lesson.is_published ? "#2e7d32" : "#ef6c00" }}>
                    {lesson.title}
                  </h3>
                  <span style={{ 
                    backgroundColor: lesson.is_published ? "#4caf50" : "#ff9800", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}>
                    {lesson.is_published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p style={{ 
                  color: "#666", 
                  fontSize: "0.9rem", 
                  marginBottom: "0.5rem"
                }}>
                  <strong>Créateur:</strong> {lesson.user?.user_name || "Inconnu"}
                </p>
                <p style={{ 
                  color: "#666", 
                  fontSize: "0.9rem", 
                  marginBottom: "1rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {lesson.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ 
                    backgroundColor: "#e3f2fd", 
                    color: "#1976d2", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}>
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    style={{ 
                      color: "#1976d2", 
                      textDecoration: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Voir →
                  </Link>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                    style={{
                      backgroundColor: "#2196f3",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(lesson.id, lesson.is_published)}
                    style={{
                      backgroundColor: lesson.is_published ? "#ff9800" : "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    {lesson.is_published ? "📝 Brouillon" : "📚 Publier"}
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brouillons */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Brouillons 📝</h2>
        {draftLessons.length === 0 ? (
          <p>Aucun brouillon trouvé.</p>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", 
            gap: "1rem" 
          }}>
            {draftLessons.map((lesson) => (
              <div key={lesson.id} style={{ 
                border: "1px solid #ff9800", 
                borderRadius: "8px", 
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#ef6c00" }}>
                    {lesson.title}
                  </h3>
                  <span style={{ 
                    backgroundColor: "#ff9800", 
                    color: "white", 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: "4px", 
                    fontSize: "0.7rem" 
                  }}>
                    BROUILLON
                  </span>
                </div>
                <p style={{ 
                  color: "#666", 
                  fontSize: "0.9rem", 
                  margin: "0.5rem 0",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {lesson.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <span style={{ 
                    backgroundColor: "#e3f2fd", 
                    color: "#1976d2", 
                    padding: "0.3rem 0.6rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}>
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    style={{ 
                      color: "#1976d2", 
                      textDecoration: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Voir →
                  </Link>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                    style={{
                      backgroundColor: "#2196f3",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(lesson.id, lesson.is_published)}
                    style={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    📚 Publier
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
