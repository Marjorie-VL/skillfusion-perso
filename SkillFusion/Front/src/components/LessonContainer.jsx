import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import ImageDisplay from "./ImageDisplay";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function LessonContainer({ lessons, categoryName}) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      await addFavorite(lessonId);
      setFavoriteIds((prev) => [...prev, lessonId]);
      toast.success("Ajouté aux favoris !");
    } else {
      await deleteFavorite(lessonId);
      setFavoriteIds((prev) => prev.filter((id) => id !== lessonId));
      toast.success("Retiré des favoris !");
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
    } catch (err) {
      toast.error(err.message);
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
    } catch (err) {
      toast.error(err.message);
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
          {user && user.role_id === 3 && (
            <a 
              onClick={() => handleClickFav(lesson.id)} 
              className="absolute top-2 right-2 cursor-pointer z-10"
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
          
          <div className="w-full flex flex-row justify-between items-center">
            <Link to={`/categories/${lesson.category?.id}/lessons`} className="no-underline text-inherit hover:opacity-80 transition-opacity">
              <h5 className="font-['Raleway'] mt-2 mb-0 p-2 bg-white border border-black rounded-md flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                {lesson.category?.name || categoryName}
              </h5>
            </Link>
            
            {user && user.role_id === 3 ? (
              <p> </p>
            ) : (
              <p> </p>
            )}
            {/* Boutons de CRUD si admin ou prof propriétaire */}
            {user && (
              <div className="w-14 flex flex-row justify-between">
                {(user.role_id === 1 || (user.role_id === 2 && lesson.user_id === user.id)) && (
                  <>
                    <a 
                      onClick={() => navigate(`/edit-lesson/${lesson.id}`)} 
                      className="cursor-pointer"
                    >
                      <h4 className="text-xl mb-4 font-display font-light text-black">{"\ud83d\udcdd"}</h4>
                    </a>
                    <a 
                      onClick={() => handleClickDeleteLesson(lesson.id)} 
                      className="cursor-pointer"
                    >
                      <h4 className="text-xl mb-4 font-display font-light text-black">{"\ud83d\uddd1"}</h4>
                    </a>
                  </>
                )}
              </div>
            )}
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
 
