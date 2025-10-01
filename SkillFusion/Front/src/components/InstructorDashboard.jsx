import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les leçons de l'instructeur (publiés + brouillons)
  useEffect(() => {
    const fetchMyLessons = async () => {
      try {
        // Récupérer tous les cours de l'instructeur (publiés + brouillons)
        const data = await lessonService.getAllLessons({ user_id: user.id });
        setMyLessons(data || []);
      } catch (error) {
        console.error("Erreur chargement leçons:", error);
        toast.error("Erreur lors du chargement de vos cours");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyLessons();
    }
  }, [user]);

  // Supprimer une leçon
  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      await lessonService.deleteLesson(lessonId);
      setMyLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      toast.success("Cours supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression cours:", error);
      toast.error("Erreur lors de la suppression du cours");
    }
  };

  // Publier/Dépublier une leçon
  const togglePublishStatus = async (lessonId, currentStatus) => {
    try {
      await lessonService.updateLesson(lessonId, { is_published: !currentStatus });
      
      setMyLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ));
      
      toast.success(`Cours ${!currentStatus ? 'publié' : 'mis en brouillon'} !`);
    } catch (error) {
      console.error("Erreur modification statut:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  // Supprimer le compte
  const deleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }

    if (!window.confirm("Dernière confirmation : Voulez-vous vraiment supprimer définitivement votre compte ?")) {
      return;
    }

    setDeleteLoading(true);
    try {
      await userService.deleteUser(user.id);
      toast.success("Compte supprimé avec succès");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur suppression compte:", error);
      toast.error("Erreur lors de la suppression du compte");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Séparer les cours publiés et brouillons
  const publishedLessons = myLessons.filter(lesson => lesson.is_published);
  const draftLessons = myLessons.filter(lesson => !lesson.is_published);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement de vos cours...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Tableau de Bord Instructeur</h1>
      <p>Bienvenue, {user.user_name} ! 👨‍🏫</p>

      {/* Actions rapides */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Actions rapides</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/new-lesson" className="main-button">
            ➕ Créer un nouveau cours
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
          <h3 style={{ margin: 0, color: "#2e7d32" }}>{myLessons.length}</h3>
          <p style={{ margin: 0, color: "#2e7d32" }}>Total des cours</p>
        </div>
        <div style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #2196f3"
        }}>
          <h3 style={{ margin: 0, color: "#1565c0" }}>{publishedLessons.length}</h3>
          <p style={{ margin: 0, color: "#1565c0" }}>Cours publiés</p>
        </div>
        <div style={{ 
          backgroundColor: "#fff3e0", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          textAlign: "center",
          border: "1px solid #ff9800"
        }}>
          <h3 style={{ margin: 0, color: "#ef6c00" }}>{draftLessons.length}</h3>
          <p style={{ margin: 0, color: "#ef6c00" }}>Brouillons</p>
        </div>
      </section>

      {/* Cours publiés */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Mes cours publiés 📚</h2>
        {publishedLessons.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            border: "2px dashed #ccc"
          }}>
            <p>Aucun cours publié pour le moment.</p>
            <Link to="/new-lesson" className="main-button">
              Créer votre premier cours
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
            gap: "1rem" 
          }}>
            {publishedLessons.map((lesson) => (
              <div key={lesson.id} style={{ 
                border: "1px solid #4caf50", 
                borderRadius: "8px", 
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#2e7d32" }}>{lesson.title}</h3>
                  <span style={{ 
                    backgroundColor: "#4caf50", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}>
                    Publié
                  </span>
                </div>
                <p style={{ 
                  color: "#666", 
                  fontSize: "0.9rem", 
                  marginBottom: "1rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
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
                <div style={{ display: "flex", gap: "0.5rem" }}>
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
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
                    style={{
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    📝 Brouillon
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
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
        <h2>Mes brouillons 📝</h2>
        {draftLessons.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            border: "2px dashed #ccc"
          }}>
            <p>Aucun brouillon pour le moment.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
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
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#ef6c00" }}>{lesson.title}</h3>
                  <span style={{ 
                    backgroundColor: "#ff9800", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px",
                    fontSize: "0.8rem"
                  }}>
                    Brouillon
                  </span>
                </div>
                <p style={{ 
                  color: "#666", 
                  fontSize: "0.9rem", 
                  marginBottom: "1rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
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
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
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
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
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
                    onClick={() => deleteLesson(lesson.id)}
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

      {/* Gestion du compte */}
      <section style={{ 
        border: "1px solid #e74c3c", 
        borderRadius: "8px", 
        padding: "1.5rem",
        backgroundColor: "#fdf2f2"
      }}>
        <h2 style={{ color: "#e74c3c", marginTop: 0 }}>Zone dangereuse ⚠️</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Ces actions sont irréversibles. Veuillez réfléchir avant d'agir.
        </p>
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
          style={{
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: deleteLoading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: deleteLoading ? 0.6 : 1
          }}
        >
          {deleteLoading ? "Suppression en cours..." : "🗑️ Supprimer mon compte"}
        </button>
      </section>
    </div>
  );
}
