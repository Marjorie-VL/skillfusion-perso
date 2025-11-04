import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favoriteLessons, setFavoriteLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // États pour les modales de suppression de compte
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteAccountConfirmModal, setShowDeleteAccountConfirmModal] = useState(false);

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
  const deleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteAccountModal(false);
    setShowDeleteAccountConfirmModal(true);
  };

  const finalConfirmDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await userService.deleteUser(user.id);
      toast.success("Compte supprimé avec succès");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur suppression compte:", error);
      toast.error("Erreur lors de la suppression du compte");
      setShowDeleteAccountConfirmModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement de vos favoris...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-['Lobster'] text-center text-4xl mb-4">Mon Tableau de Bord</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name} ! 👋</p>

      {/* Actions rapides */}
      <section className="mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Actions rapides</h2>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/profil-changes" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            ✏️ Modifier mon profil
          </Link>
          <Link to="/lessons" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            📚 Voir tous les cours
          </Link>
          <Link to="/categories" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            🏷️ Parcourir par catégorie
          </Link>
        </div>
      </section>

      {/* Leçons favorites */}
      <section className="mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes cours favoris ⭐</h2>
        {favoriteLessons.length === 0 ? (
          <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
            <p className="mb-4 text-skill-text-primary">Vous n'avez pas encore de cours favoris.</p>
            <Link to="/lessons" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors inline-block">
              Découvrir des cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteLessons.map((lesson) => (
              <div key={lesson.id} className="border border-skill-success/40 bg-skill-success/15 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="m-0 text-lg font-['Lobster'] font-semibold text-skill-text-primary">{lesson.title}</h3>
                  <button
                    onClick={() => removeFavorite(lesson.id)}
                    className="bg-transparent border-none text-2xl cursor-pointer text-yellow-400 hover:text-yellow-600"
                    title="Retirer des favoris"
                  >
                    ⭐
                  </button>
                </div>
                <p className="text-skill-text-secondary text-sm mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="bg-skill-primary text-skill-text-primary py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    className="text-skill-secondary no-underline font-['Lobster'] font-bold hover:text-skill-accent"
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
      <section className="mt-8 text-center">
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
          className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-['Lobster'] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "Suppression en cours..." : "🗑️ Supprimer mon compte"}
        </button>
      </section>

      {/* Modales de confirmation suppression de compte */}
      <ConfirmDeleteModal
        show={showDeleteAccountModal}
        onCancel={() => setShowDeleteAccountModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Supprimer votre compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      />

      <ConfirmDeleteModal
        show={showDeleteAccountConfirmModal}
        onCancel={() => setShowDeleteAccountConfirmModal(false)}
        onConfirm={finalConfirmDeleteAccount}
        title="Dernière confirmation"
        message="Voulez-vous vraiment supprimer définitivement votre compte ? Cette action est irréversible et ne peut pas être annulée."
        confirmText="Oui, supprimer définitivement"
      />
    </div>
  );
}