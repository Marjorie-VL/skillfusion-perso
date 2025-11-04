import React from "react";
import { Link } from "react-router-dom";
import ConfirmDeleteModal from "../../pages/ConfirmDeleteModal.jsx";

/**
 * Composant réutilisable pour la gestion des cours
 * @param {Array} lessons - Liste des cours
 * @param {function} onTogglePublish - Callback pour publier/dépublier (lessonId, currentStatus)
 * @param {function} onDelete - Callback pour supprimer (lessonId)
 * @param {boolean} showCreator - Afficher le nom du créateur (pour Admin)
 * @param {function} onCreateNew - Callback pour créer un nouveau cours (optionnel, pour Instructor)
 */
export default function CourseManagementTab({ 
  lessons, 
  onTogglePublish, 
  onDelete, 
  showCreator = false,
  onCreateNew 
}) {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState({ id: null, name: "" });

  const publishedLessons = lessons.filter(lesson => lesson.is_published);
  const draftLessons = lessons.filter(lesson => !lesson.is_published);

  const handleDeleteClick = (lessonId, lessonTitle) => {
    setDeleteTarget({ id: lessonId, name: lessonTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget.id && onDelete) {
      onDelete(deleteTarget.id);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* Statistiques */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-skill-secondary/20 p-6 rounded-lg text-center border border-skill-secondary/40 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-display font-bold">{lessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Total des cours</p>
        </div>
        <div className="bg-skill-success/20 p-6 rounded-lg text-center border border-skill-success/50 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-display font-bold">{publishedLessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Cours publiés</p>
        </div>
        <div className="bg-skill-warning/20 p-6 rounded-lg text-center border border-skill-warning/50 shadow-md">
          <h3 className="m-0 text-3xl text-skill-text-primary font-display font-bold">{draftLessons.length}</h3>
          <p className="m-0 text-skill-text-primary font-medium">Brouillons</p>
        </div>
      </section>

      {/* Cours publiés */}
      <section className="mb-8">
        <h2 className="font-display text-center text-2xl md:text-3xl my-4">
          {showCreator ? "Cours publiés" : "Mes cours publiés"}
        </h2>
        {publishedLessons.length === 0 ? (
          <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
            <p className="mb-4 text-skill-text-primary">
              {showCreator ? "Aucun cours publié trouvé." : "Aucun cours publié pour le moment."}
            </p>
            {onCreateNew && (
              <button 
                onClick={onCreateNew}
                className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors"
              >
                Créer votre premier cours
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedLessons.map((lesson) => (
              <div key={lesson.id} className="border border-skill-success/40 bg-skill-success/15 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-skill-primary text-white py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <span className="bg-skill-success text-white py-1 px-2 rounded text-xs font-display font-semibold">
                    Publié
                  </span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="m-0 text-lg text-skill-text-primary font-display font-semibold">{lesson.title}</h3>
                </div>
                {showCreator && (
                  <p className="text-skill-text-primary text-sm mb-2">
                    <strong>Créateur:</strong> {lesson.user?.user_name?.replace(/^./, (match) => match.toUpperCase()) || "Inconnu"}
                  </p>
                )}
                <p className="text-skill-text-secondary text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex justify-end items-center mb-4">
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    className="text-skill-secondary no-underline font-display font-bold hover:text-skill-accent"
                  >
                    Voir →
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    <Link 
                      to={`/edit-lesson/${lesson.id}`}
                      className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-secondary/80 transition-colors font-display"
                    >
                      Modifier
                    </Link>
                    {onTogglePublish && (
                      <button
                        onClick={() => onTogglePublish(lesson.id, lesson.is_published)}
                        className="bg-skill-secondary text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-skill-secondary/80 transition-colors font-display"
                      >
                        Brouillon
                      </button>
                    )}
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => handleDeleteClick(lesson.id, lesson.title)}
                      className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-display"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brouillons */}
      <section className="mb-8">
        <h2 className="font-display text-center text-2xl md:text-3xl my-4">
          {showCreator ? "Brouillons" : "Mes brouillons"}
        </h2>
        {draftLessons.length === 0 ? (
          <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
            <p className="text-skill-text-primary">
              {showCreator ? "Aucun brouillon trouvé." : "Aucun brouillon pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftLessons.map((lesson) => (
              <div key={lesson.id} className="border border-skill-warning/40 bg-skill-warning/15 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-skill-primary text-white py-1 px-2 rounded text-xs border border-skill-secondary">
                    {lesson.category?.name || "Sans catégorie"}
                  </span>
                  <span className="bg-skill-warning text-white py-1 px-2 rounded text-xs font-display font-semibold">
                    Brouillon
                  </span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="m-0 text-lg text-skill-text-primary font-display font-semibold">{lesson.title}</h3>
                </div>
                <p className="text-skill-text-secondary text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex justify-end items-center mb-4">
                  <Link 
                    to={`/lesson/${lesson.id}`} 
                    className="text-skill-secondary no-underline font-display font-bold hover:text-skill-accent"
                  >
                    Voir →
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap justify-between items-center">
                  <div className="flex gap-2 flex-wrap">
                    <Link 
                      to={`/edit-lesson/${lesson.id}`}
                      className="bg-skill-secondary text-white border-none py-2 px-4 rounded no-underline text-sm cursor-pointer hover:bg-skill-secondary/80 transition-colors font-display"
                    >
                      Modifier
                    </Link>
                    {onTogglePublish && (
                      <button
                        onClick={() => onTogglePublish(lesson.id, lesson.is_published)}
                        className="bg-skill-success text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-green-600 transition-colors font-display"
                      >
                        Publier
                      </button>
                    )}
                  </div>
                  {onDelete && (
                    <button
                      onClick={() => handleDeleteClick(lesson.id, lesson.title)}
                      className="bg-skill-danger text-white border-none py-2 px-4 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors font-display"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modale de confirmation suppression */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le cours"
        message={`Voulez-vous vraiment supprimer le cours "${deleteTarget.name}" ?`}
      />
    </>
  );
}

