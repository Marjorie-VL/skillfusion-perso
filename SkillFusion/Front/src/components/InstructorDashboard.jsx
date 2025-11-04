import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // États pour les modales de suppression
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteAccountConfirmModal, setShowDeleteAccountConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
  const deleteLesson = (lessonId) => {
    setDeleteTargetId(lessonId);
    setShowDeleteLessonModal(true);
  };

  const confirmDeleteLesson = async () => {
    try {
      await lessonService.deleteLesson(deleteTargetId);
      setMyLessons(prev => prev.filter(lesson => lesson.id !== deleteTargetId));
      toast.success("Cours supprimé avec succès !");
      setShowDeleteLessonModal(false);
    } catch (error) {
      console.error("Erreur suppression cours:", error);
      toast.error("Erreur lors de la suppression du cours");
      setShowDeleteLessonModal(false);
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

  // Séparer les cours publiés et brouillons
  const publishedLessons = myLessons.filter(lesson => lesson.is_published);
  const draftLessons = myLessons.filter(lesson => !lesson.is_published);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement de vos cours...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-['Lobster'] text-center text-4xl mb-4">Tableau de Bord Instructeur</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name} ! 👨‍🏫</p>

      {/* Actions rapides */}
      <section className="mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Actions rapides</h2>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/new-lesson" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            ➕ Créer un nouveau cours
          </Link>
          <Link to="/profil-changes" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            ✏️ Modifier mon profil
          </Link>
          <Link to="/lessons" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors">
            📚 Voir tous les cours
          </Link>
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-skill-secondary/20 p-6 rounded-lg text-center border border-skill-secondary/40 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{myLessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Total des cours</p>
        </div>
        <div className="bg-skill-success/20 p-6 rounded-lg text-center border border-skill-success/50 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{publishedLessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Cours publiés</p>
        </div>
        <div className="bg-skill-warning/20 p-6 rounded-lg text-center border border-skill-warning/50 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-['Lobster'] font-bold">{draftLessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Brouillons</p>
        </div>
      </section>

      {/* Cours publiés */}
      <section className="mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes cours publiés 📚</h2>
        {publishedLessons.length === 0 ? (
          <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
            <p className="mb-4 text-skill-text-primary">Aucun cours publié pour le moment.</p>
            <Link to="/new-lesson" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors inline-block">
              Créer votre premier cours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedLessons.map((lesson) => (
              <div key={lesson.id} className="border border-skill-success/40 bg-skill-success/15 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="m-0 text-lg text-skill-text-primary font-['Lobster'] font-semibold">{lesson.title}</h3>
                  <span className="bg-skill-success text-white py-1 px-2 rounded text-xs font-['Lobster'] font-semibold">
                    Publié
                  </span>
                </div>
                <p className="text-skill-text-secondary text-sm mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-skill-primary text-skill-text-primary py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    className="text-skill-secondary no-underline font-['Lobster'] font-bold hover:text-skill-accent"
                  >
                    Voir →
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                    className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-accent transition-colors font-['Lobster']"
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
                    className="bg-skill-warning text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-orange-600 transition-colors font-['Lobster']"
                  >
                    📝 Brouillon
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-['Lobster']"
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
      <section className="mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes brouillons 📝</h2>
        {draftLessons.length === 0 ? (
          <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
            <p className="text-skill-text-primary">Aucun brouillon pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftLessons.map((lesson) => (
              <div key={lesson.id} className="border border-skill-warning/40 bg-skill-warning/15 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="m-0 text-lg text-skill-text-primary font-['Lobster'] font-semibold">{lesson.title}</h3>
                  <span className="bg-skill-warning text-white py-1 px-2 rounded text-xs font-['Lobster'] font-semibold">
                    Brouillon
                  </span>
                </div>
                <p className="text-skill-text-secondary text-sm mb-4 line-clamp-3">
                  {lesson.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-skill-primary text-skill-text-primary py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link 
                    to={`/edit-lesson/${lesson.id}`}
                    className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-accent transition-colors font-['Lobster']"
                  >
                    ✏️ Modifier
                  </Link>
                  <button
                    onClick={() => togglePublishStatus(lesson.id, lesson.is_published)}
                    className="bg-skill-success text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-green-600 transition-colors font-['Lobster']"
                  >
                    📚 Publier
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-['Lobster']"
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
      <section className="mt-8 text-center">
        <button
          onClick={deleteAccount}
          disabled={deleteLoading}
          className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-['Lobster'] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "Suppression en cours..." : "🗑️ Supprimer mon compte"}
        </button>
      </section>

      {/* Modales de confirmation suppression */}
      <ConfirmDeleteModal
        show={showDeleteLessonModal}
        onCancel={() => setShowDeleteLessonModal(false)}
        onConfirm={confirmDeleteLesson}
        title="Supprimer le cours"
        message="Êtes-vous sûr de vouloir supprimer ce cours ?"
      />

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
