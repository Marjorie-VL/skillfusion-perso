import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import { authService } from "../services/authService.js";
import ImageDisplay from "./ImageDisplay";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function LessonContainer({ lessons, categoryName}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [lessonList, setLessonList] =  useState(lessons || []);

    useEffect(() => { setLessonList(lessons || []);
    }, [lessons]);
    // Stocke les IDs des leçons favorites de l'utilisateur
    const [favoriteIds, setFavoriteIds] = useState([]);
    // États pour la modale de suppression
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Initialisation des favoris à partir de l'utilisateur connecté
  useEffect(() => {
    if (user && user.favorite_lessons) {
      setFavoriteIds(user.favorite_lessons.map((less) => less.id));
    }
  }, [user]);

  
  if (!lessonList.length) {
    return <div>Aucune leçon trouvée.</div>;
  }

  // Gère l'ajout ou le retrait d'une leçon des favoris (uniquement pour les utilisateurs simples)
  const handleClickFav = async (lessonId) => {
    if (!favoriteIds.includes(lessonId)) {
      const success = await addFavorite(lessonId);
      if (success) {
        setFavoriteIds((prev) => [...prev, lessonId]);
        toast.success("Ajouté aux favoris !");
        // Recharger les données utilisateur pour synchroniser les favoris
        await refreshUserData();
      }
    } else {
      const success = await deleteFavorite(lessonId);
      if (success) {
        setFavoriteIds((prev) => prev.filter((id) => id !== lessonId));
        toast.success("Retiré des favoris !");
        // Recharger les données utilisateur pour synchroniser les favoris
        await refreshUserData();
      }
    }
  };

  // Recharge les données utilisateur depuis le serveur
  const refreshUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Erreur lors du rechargement des données utilisateur:", err);
    }
  };

  // Ajoute une leçon aux favoris
  const addFavorite = async (lessonId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout aux favoris");
      }
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // Supprime une leçon des favoris
  const deleteFavorite = async (lessonId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}/favorite`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression des favoris");
      }
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // Supprime une leçon
  const handleClickDeleteLesson = (lessonId) => {
    setDeleteTargetId(lessonId);
    setShowDeleteModal(true);
  };

  const confirmDeleteLesson = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${deleteTargetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du cours");
      }
      setLessonList((prev) => prev.filter((lesson) => lesson.id !== deleteTargetId));
      toast.success("Suppression du cours réussie !");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.message);
      setShowDeleteModal(false);
    }
  };

  return (
    <section aria-label="Liste des catégories" className="w-full flex flex-wrap justify-center items-center gap-6">
      {lessonList.map((lesson) => (
        <div 
          key={lesson.id}
          className="relative bg-skill-tertiary p-5 border border-skill-success/50 rounded-lg flex flex-col justify-between items-center flex-shrink-0 w-[350px] h-[400px] shadow-md"
        >
          {/* Étoile de favoris en haut à droite */}
          {user && (user.role_id === 2 || user.role_id === 3) && (
            <a 
              onClick={() => handleClickFav(lesson.id)} 
              className="absolute top-2 right-2 cursor-pointer z-10 hover:scale-110 transition-transform"
              title={favoriteIds.includes(lesson.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <p className={`text-3xl m-0 p-0 ${
                favoriteIds.includes(lesson.id) 
                  ? "text-yellow-400" 
                  : "text-black"
              }`} style={favoriteIds.includes(lesson.id) ? {
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000, 1px 0 0 #000'
              } : {}}>
                {favoriteIds.includes(lesson.id) ? "\u2605" : "\u2606"}
              </p>
            </a>
          )}
          
          {/* Boutons de CRUD en haut à gauche si admin ou prof propriétaire */}
          {user && (user.role_id === 1 || (user.role_id === 2 && lesson.user_id === user.id)) && (
            <div className="absolute top-2 left-2 flex flex-row gap-2 z-10">
              <button 
                onClick={() => navigate(`/edit-lesson/${lesson.id}`)} 
                className="bg-skill-secondary text-white p-1 sm:p-1.5 rounded-lg hover:bg-skill-accent transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                title="Modifier le cours"
                aria-label="Modifier le cours"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                onClick={() => handleClickDeleteLesson(lesson.id)} 
                className="bg-red-600 text-white p-1 sm:p-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-md active:scale-95 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
                title="Supprimer le cours"
                aria-label="Supprimer le cours"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="w-full flex flex-row justify-center items-center mt-2">
            <Link to={`/categories/${lesson.category?.id}/lessons`} className="no-underline text-inherit hover:opacity-80 transition-opacity">
              <h5 className="font-['Raleway'] mt-2 mb-0 p-2 bg-white border border-black rounded-md flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                {lesson.category?.name || categoryName}
              </h5>
            </Link>
          </div>
          
          <div className="flex flex-col justify-center items-start font-light w-full flex-grow">
            <h4 className="text-lg md:text-xl mb-3 font-display font-bold text-black text-center w-full line-clamp-2">{lesson.title}</h4>
          </div>
          <Link to={`/lesson/${lesson.id}`} className="no-underline text-inherit w-full flex-shrink-0">
            <div className="w-full h-[150px] overflow-hidden border border-black my-3 shadow-[2px_2px_rgb(122,122,122)] rounded">
              {lesson.media_url ? (
                lesson.media_url.startsWith('/uploads/') ? (
                  <img
                    className="w-full h-full object-cover object-[50%_50%]"
                    src={`${import.meta.env.VITE_API_URL}${lesson.media_url}`}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : lesson.media_url.startsWith('http') ? (
                  <img
                    className="w-full h-full object-cover object-[50%_50%]"
                    src={lesson.media_url}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover object-[50%_50%]"
                    src={`/Images/Photos/${lesson.media_url}`}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                )
              ) : (
                <div className="p-4">
                  <p>Aucune image</p>
                </div>
              )}
              <div className="p-4 hidden">
                <p>Image non disponible</p>
              </div>
            </div>
          </Link>
          <p className="px-2 text-justify text-sm line-clamp-3 w-full mb-2 flex-grow">{lesson.description}</p>
        </div>
      ))}
      
      {/* Modale de confirmation suppression leçon */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteLesson}
        title="Supprimer le cours"
        message="Êtes-vous sûr(e) de vouloir supprimer ce cours ?"
      />
    </section>
  );
}
 
