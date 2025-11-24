import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";
import TabBar from "./shared/TabBar.jsx";
import ProfileTab from "./shared/ProfileTab.jsx";
import CourseCreationForm from "./shared/CourseCreationForm.jsx";
import CourseManagementTab from "./shared/CourseManagementTab.jsx";

export default function InstructorDashboard() {
  const { user, setUser } = useAuth();
  const [myLessons, setMyLessons] = useState([]);
  const [favoriteLessons, setFavoriteLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cours"); // Onglet par défaut : Gestion des Cours

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
        setFavoritesLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Fonction pour supprimer un cours
  const handleDeleteLesson = async (lessonId) => {
    try {
      await lessonService.deleteLesson(lessonId);
      setMyLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      toast.success("Cours supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression cours:", error);
      toast.error("Erreur lors de la suppression du cours");
    }
  };

  // Callback après création réussie d'un cours
  const handleCourseCreated = async () => {
    // Recharger les cours pour mettre à jour la liste
    const data = await lessonService.getAllLessons({ user_id: user.id });
    setMyLessons(data || []);
    
    // Changer d'onglet pour voir le cours créé
    setActiveTab("cours");
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


  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement de vos cours...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-center text-4xl mb-4">Tableau de Bord Instructeur</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name} !</p>

      {/* Barre d'onglets */}
      <TabBar
        tabs={[
          { id: "cours", label: "Gestion des Cours" },
          { id: "creer", label: "Créer un Cours" },
          { id: "favoris", label: "Mes Favoris" },
          { id: "profil", label: "Profil" }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu de l'onglet Gestion des Cours */}
      {activeTab === "cours" && (
        <CourseManagementTab
          lessons={myLessons}
          onTogglePublish={togglePublishStatus}
          onDelete={handleDeleteLesson}
          showCreator={false}
          onCreateNew={() => setActiveTab("creer")}
        />
      )}

      {/* Contenu de l'onglet Créer un Cours */}
      {activeTab === "creer" && (
        <CourseCreationForm user={user} onSuccess={handleCourseCreated} />
      )}

      {/* Contenu de l'onglet Favoris */}
      {activeTab === "favoris" && (
        <section className="mb-8">
          <h2 className="font-display text-center text-2xl md:text-3xl my-4">Mes cours favoris</h2>
          {favoritesLoading ? (
            <div className="text-center p-8">
              <p>Chargement de vos favoris...</p>
            </div>
          ) : favoriteLessons.length === 0 ? (
            <div className="text-center p-8 bg-skill-primary/10 rounded-lg border-2 border-dashed border-skill-secondary/30">
              <p className="mb-4 text-skill-text-primary">Vous n'avez pas encore de cours favoris.</p>
              <Link to="/lessons" className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors inline-block">
                Découvrir des cours
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteLessons.map((lesson) => (
                <div key={lesson.id} className="border border-skill-success/40 bg-skill-success/15 rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="m-0 text-lg font-display font-semibold text-skill-text-primary">{lesson.title}</h3>
                    <button
                      onClick={() => removeFavorite(lesson.id)}
                      className="bg-transparent border-none text-2xl cursor-pointer text-yellow-400 hover:text-yellow-600 transition-colors"
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
                      className="text-skill-secondary no-underline font-display font-bold hover:text-skill-accent"
                    >
                      Voir le cours →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Contenu de l'onglet Profil */}
      {activeTab === "profil" && (
        <ProfileTab user={user} setUser={setUser} />
      )}
    </div>
  );
}
