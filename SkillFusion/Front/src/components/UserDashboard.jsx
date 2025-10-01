import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoriteLessons, setFavoriteLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les leçons favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await userService.getUserFavorites(user.id);
        setFavoriteLessons(data.favorite_lessons || []);
      } catch (error) {
        console.error("Erreur chargement favoris:", error);
        toast.error("Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Supprimer un favori
  const removeFavorite = async (lessonId) => {
    try {
      await lessonService.deleteFavorite(lessonId);
      setFavoriteLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      toast.success("Retiré des favoris !");
    } catch (error) {
      console.error("Erreur suppression favori:", error);
      toast.error("Erreur lors de la suppression du favori");
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement de vos favoris...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Mon Tableau de Bord</h1>
      <p>Bienvenue, {user.user_name} ! 👋</p>

      {/* Actions rapides */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Actions rapides</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/profil-changes" className="main-button">
            ✏️ Modifier mon profil
          </Link>
          <Link to="/lessons" className="main-button">
            📚 Voir tous les cours
          </Link>
          <Link to="/categories" className="main-button">
            🏷️ Parcourir par catégorie
          </Link>
        </div>
      </section>

      {/* Leçons favorites */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Mes cours favoris ⭐</h2>
        {favoriteLessons.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "2rem", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            border: "2px dashed #ccc"
          }}>
            <p>Vous n'avez pas encore de cours favoris.</p>
            <Link to="/lessons" className="main-button">
              Découvrir des cours
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1rem" 
          }}>
            {favoriteLessons.map((lesson) => (
              <div key={lesson.id} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{lesson.title}</h3>
                  <button
                    onClick={() => removeFavorite(lesson.id)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      color: "#ffd700"
                    }}
                    title="Retirer des favoris"
                  >
                    ⭐
                  </button>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    Voir le cours →
                  </Link>
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