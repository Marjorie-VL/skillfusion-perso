import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";
import TabBar from "./shared/TabBar.jsx";
import ProfileTab from "./shared/ProfileTab.jsx";
import CourseCreationForm from "./shared/CourseCreationForm.jsx";
import CourseManagementTab from "./shared/CourseManagementTab.jsx";

export default function AdminDashboard({ usersData }) {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState(usersData);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("utilisateurs"); // Onglet par défaut : Gestion des Utilisateurs
  
  // États pour les modales de suppression
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, name: "" });


  // Synchroniser usersData avec l'état local
  useEffect(() => {
    setUsers(usersData || []);
  }, [usersData]);

  // Charger tous les cours (publiés + brouillons) pour l'admin
  useEffect(() => {
    const fetchAllLessons = async () => {
      try {
        // Pour l'admin, on récupère tous les cours (publiés + brouillons)
        // On utilise un paramètre spécial pour forcer l'inclusion des brouillons
        console.log('🔍 AdminDashboard - Fetching all lessons with drafts...');
        const data = await lessonService.getAllLessons({ include_drafts: true });
        console.log('🔍 AdminDashboard - Received lessons:', data);
        console.log('🔍 AdminDashboard - Lessons details:', data?.map(l => ({ id: l.id, title: l.title, is_published: l.is_published })));
        setAllLessons(data || []);
      } catch (error) {
        console.error("Erreur chargement cours:", error);
        toast.error("Erreur lors du chargement des cours");
      } finally {
        setLoading(false);
      }
    };

    fetchAllLessons();
  }, []);


  // Fonction pour obtenir le nom du rôle
  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return "Administrateur";
      case 2: return "Instructeur";
      case 3: return "Utilisateur";
      default: return "Inconnu";
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    setDeleteTarget({ type: "user", id: userId, name: targetUser?.user_name || "cet utilisateur" });
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      // Mise à jour locale de la liste des utilisateurs
      setUsers(users.filter((user) => user.id !== deleteTarget.id));
      toast.success("Utilisateur supprimé avec succès !");
      setShowDeleteUserModal(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
      setShowDeleteUserModal(false);
    }
  };

  // Fonction pour changer le rôle d'un utilisateur
  const handleChangeRole = async (userId, newRoleId) => {
    try {
      // Récupérer l'utilisateur avant la modification pour le message
      const targetUser = users.find(u => u.id === userId);
      const oldRoleName = getRoleName(targetUser.role_id);
      const newRoleName = getRoleName(newRoleId);

      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_id: newRoleId }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du rôle");

      // Mise à jour locale
      setUsers(users.map(user => user.id === userId ? { ...user, role_id: newRoleId } : user));
      
      // Toast de succès avec message détaillé
      toast.success(`L'utilisateur "${targetUser.user_name}" est passé du rôle "${oldRoleName}" à "${newRoleName}"`);
    } catch (error) {
      console.error("❌ Erreur modification rôle →", error.message);
      toast.error("Erreur lors de la modification du rôle : " + error.message);
    }
  };

  // Fonction pour supprimer un cours
  const handleDeleteLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression du cours");

      // Mise à jour locale
      setAllLessons(allLessons.filter((lesson) => lesson.id !== lessonId));
      toast.success("Cours supprimé avec succès !");
    } catch (error) {
      console.error("❌ Erreur suppression cours →", error.message);
      toast.error("Erreur lors de la suppression du cours : " + error.message);
    }
  };

  // Callback après création réussie d'un cours
  const handleCourseCreated = async () => {
    // Recharger les cours pour mettre à jour la liste
    const data = await lessonService.getAllLessons({ include_drafts: true });
    setAllLessons(data || []);
    
    // Changer d'onglet pour voir le cours créé
    setActiveTab("cours");
  };

  // Fonction pour publier/dépublier un cours
  const handleTogglePublish = async (lessonId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: !currentStatus }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification du statut");

      // Mise à jour locale
      setAllLessons(allLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ));
      toast.success(`Cours ${!currentStatus ? 'publié' : 'mis en brouillon'} !`);
    } catch (error) {
      console.error("❌ Erreur modification statut →", error.message);
      toast.error("Erreur lors de la modification du statut : " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-center text-4xl mb-4">Tableau de Bord Administrateur</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name} !</p>

      {/* Barre d'onglets */}
      <TabBar
        tabs={[
          { id: "utilisateurs", label: "Gestion des Utilisateurs" },
          { id: "cours", label: "Gestion des Cours" },
          { id: "creer", label: "Créer un Cours" },
          { id: "profil", label: "Profil" }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenu de l'onglet Profil */}
      {activeTab === "profil" && (
        <ProfileTab user={user} setUser={setUser} />
      )}

      {/* Contenu de l'onglet Gestion des Utilisateurs */}
      {activeTab === "utilisateurs" && (
        <>
          {/* Statistiques Utilisateurs */}
          <section className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
            <div className="bg-skill-primary/20 p-6 rounded-lg text-center border border-skill-primary/40 shadow-md">
              <h3 className="m-0 text-3xl text-skill-text-primary font-display font-bold">{users.length}</h3>
              <p className="m-0 text-skill-text-primary font-medium">Total des utilisateurs</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-center text-2xl md:text-3xl my-4">Gestion des utilisateurs</h2>
        {users.length === 0 ? (
          <p className="text-center">Aucun utilisateur trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-skill-tertiary/30 rounded-lg overflow-hidden shadow-md border border-skill-success/30">
              <thead>
                <tr className="bg-skill-primary/40">
                  <th className="p-4 text-left border-b border-skill-secondary/50 font-display text-skill-text-primary">Nom</th>
                  <th className="p-4 text-left border-b border-skill-secondary/50 font-display text-skill-text-primary">Email</th>
                  <th className="p-4 text-left border-b border-skill-secondary/50 font-display text-skill-text-primary">Rôle</th>
                  <th className="p-4 text-left border-b border-skill-secondary/50 font-display text-skill-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-skill-success/20 hover:bg-skill-primary/15">
                    <td className="p-4 text-skill-text-primary">
                      {userItem.user_name.replace(/^./, (match) => match.toUpperCase())}
                    </td>
                    <td className="p-4 text-skill-text-primary">
                      {userItem.email}
                    </td>
                    <td className="p-4">
                      <select
                        value={userItem.role_id}
                        onChange={(e) => handleChangeRole(userItem.id, parseInt(e.target.value))}
                        className="p-2 rounded border border-skill-secondary bg-white text-skill-text-primary focus:outline-none focus:ring-2 focus:ring-skill-accent"
                      >
                        <option value={1}>Administrateur</option>
                        <option value={2}>Instructeur</option>
                        <option value={3}>Utilisateur</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer hover:bg-red-700 transition-colors font-display"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </section>
        </>
      )}

      {/* Contenu de l'onglet Gestion des Cours */}
      {activeTab === "cours" && (
        <CourseManagementTab
          lessons={allLessons}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteLesson}
          showCreator={true}
        />
      )}

      {/* Contenu de l'onglet Créer un Cours */}
      {activeTab === "creer" && (
        <CourseCreationForm user={user} onSuccess={handleCourseCreated} />
      )}

      {/* Modale de confirmation suppression utilisateur */}
      <ConfirmDeleteModal
        show={showDeleteUserModal}
        onCancel={() => setShowDeleteUserModal(false)}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        message={`Voulez-vous vraiment supprimer l'utilisateur "${deleteTarget.name}" ?`}
      />
    </div>
  );
}
