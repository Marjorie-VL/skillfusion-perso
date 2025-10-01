import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import ImageDisplay from "./ImageDisplay";

export default function LessonContainer({ lessons, categoryName}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessonList, setLessonList] =  useState(lessons || []);

    useEffect(() => { setLessonList(lessons || []);
    }, [lessons]);
    // Stocke les IDs des leçons favorites de l'utilisateur
    const [favoriteIds, setFavoriteIds] = useState([]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}/favorite`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}/favorite`, {
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
  const handleClickDeleteLesson = async (lessonId) => {
    if (!window.confirm("Etes-vous sûr(e) ?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/${lessonId}`, {
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
      setLessonList((prev) => prev.filter((lesson) => lesson.id !== lessonId));
      toast.success("Suppression du cours réussie !");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="list-category" aria-label="Liste des catégories">
      {lessonList.map((lesson) => (
        <div className="box-lesson" key={lesson.id}>
          <div className="box-lesson__favorites">
            <h5 className="category-tag">{lesson.category?.name || categoryName}</h5>
            <p className="instructor-name" style={{ 
              fontSize: '0.9rem', 
              color: '#666', 
              margin: '0.2rem 0',
              fontStyle: 'italic'
            }}>
              Par {lesson.user?.user_name || 'Instructeur inconnu'}
            </p>
            {user && user.role_id === 3 ? (
              <a onClick={() => handleClickFav(lesson.id)} style={{ cursor: "pointer" }}>
                <p>{favoriteIds.includes(lesson.id) ? "\u2605" : "\u2606"}</p>
              </a>
            ) : (
              <p> </p>
            )}
            {/* Boutons de CRUD si admin ou prof propriétaire */}
            {user && (
              <div className="crud">
                {(user.role_id === 1 || (user.role_id === 2 && lesson.user_id === user.id)) && (
                  <>
                    <a onClick={() => navigate(`/edit-lesson/${lesson.id}`)} style={{ cursor: "pointer" }}>
                      <h4>{"\ud83d\udcdd"}</h4>
                    </a>
                    <a onClick={() => handleClickDeleteLesson(lesson.id)} style={{ cursor: "pointer" }}>
                      <h4>{"\ud83d\uddd1"}</h4>
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="box-lesson__title">
            <h4>{lesson.title}</h4>
          </div>
          <Link to={`/lesson/${lesson.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="box-lesson__img">
              {lesson.media_url ? (
                lesson.media_url.startsWith('/uploads/') ? (
                  <img
                    className="image-lesson"
                    src={`${import.meta.env.VITE_API_URL}${lesson.media_url}`}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : lesson.media_url.startsWith('http') ? (
                  <img
                    className="image-lesson"
                    src={lesson.media_url}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <img
                    className="image-lesson"
                    src={`/Images/Photos/${lesson.media_url}`}
                    alt={lesson.media_alt || lesson.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                )
              ) : (
                <div className="no-image-placeholder">
                  <p>Aucune image</p>
                </div>
              )}
              <div className="no-image-placeholder" style={{ display: 'none' }}>
                <p>Image non disponible</p>
              </div>
            </div>
          </Link>
          <p>{lesson.description}</p>
        </div>
      ))}
    </section>
  );
}
 