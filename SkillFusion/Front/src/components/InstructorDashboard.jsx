import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import TabBar from "./shared/TabBar.jsx";
import ProfileTab from "./shared/ProfileTab.jsx";
import CourseCreationForm from "./shared/CourseCreationForm.jsx";
import CourseManagementTab from "./shared/CourseManagementTab.jsx";

export default function InstructorDashboard() {
  const { user, setUser } = useAuth();
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(true);
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

      {/* Contenu de l'onglet Profil */}
      {activeTab === "profil" && (
        <ProfileTab user={user} setUser={setUser} />
      )}
    </div>
  );
}
