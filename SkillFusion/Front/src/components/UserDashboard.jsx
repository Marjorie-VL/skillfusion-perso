import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../services/api.jsx";
import { lessonService } from "../services/lessonService.js";
import { userService } from "../services/userService.js";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";
import api from "../services/axios.js";

export default function UserDashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [favoriteLessons, setFavoriteLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("favoris"); // Onglet par défaut : Favoris
  
  // États pour le formulaire de profil
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  
  // États pour les modales de suppression de compte
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteAccountConfirmModal, setShowDeleteAccountConfirmModal] = useState(false);

  // Initialiser les valeurs du formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setUsername(user.user_name || "");
      setEmail(user.email || "");
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="font-['Lobster'] text-center text-4xl mb-4">Mon Tableau de Bord</h1>
      <p className="text-center text-xl mb-8">Bienvenue, {user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name} !</p>

      {/* Barre d'onglets */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-skill-secondary/30">
        <button
          onClick={() => setActiveTab("favoris")}
          className={`font-['Lobster'] text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === "favoris"
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          Mes Favoris
        </button>
        <button
          onClick={() => setActiveTab("profil")}
          className={`font-['Lobster'] text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === "profil"
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          Profil
        </button>
      </div>

      {/* Contenu de l'onglet Favoris */}
      {activeTab === "favoris" && (
        <section className="mb-8">
          <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-4">Mes cours favoris</h2>
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
      )}

      {/* Contenu de l'onglet Profil */}
      {activeTab === "profil" && (
        <section className="mb-8">
          <h2 className="font-['Lobster'] text-center text-2xl md:text-3xl my-8">Mon Profil</h2>
          
          <div className="w-full max-w-[900px] mx-auto px-4">
            <div className="bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
              <form method="post" onSubmit={async (e) => {
                e.preventDefault();
                setProfileErrors({});

                // Vérification qu'au moins un champ est modifié
                if (!username && !email && !password) {
                  toast.error("Veuillez modifier au moins un champ");
                  return;
                }

                // Préparer les données à envoyer (seulement les champs modifiés)
                const updateData = {};
                if (username && username !== user.user_name) updateData.user_name = username;
                if (email && email !== user.email) updateData.email = email;
                if (password) updateData.password = password;

                if (Object.keys(updateData).length === 0) {
                  toast.error("Veuillez modifier au moins un champ");
                  return;
                }

                try {
                  await api.patch(`/users/${user.id}`, updateData);
                  
                  // Récupérer les données utilisateur mises à jour
                  const updatedUserResponse = await api.get('/me');
                  const updatedUserData = updatedUserResponse.data;

                  // Mettre à jour le contexte
                  setUser(updatedUserData);
                  localStorage.setItem('user', JSON.stringify(updatedUserData));

                  // Message de succès
                  const modifiedFields = [];
                  if (updateData.user_name) modifiedFields.push("nom d'utilisateur");
                  if (updateData.email) modifiedFields.push("email");
                  if (updateData.password) modifiedFields.push("mot de passe");
                  
                  const message = `Modification réussie ! ${modifiedFields.join(", ")} ${modifiedFields.length > 1 ? "ont été" : "a été"} mis à jour ✅`;
                  toast.success(message);

                  // Réinitialiser le mot de passe
                  setPassword("");

                } catch (error) {
                  if (error.response) {
                    const { status, data } = error.response;
                    
                    if (status === 400 && data.errors) {
                      setProfileErrors(data.errors);
                    } else if (data.message) {
                      toast.error(data.message);
                    } else {
                      toast.error("Erreur lors de la modification du profil");
                    }
                  } else {
                    toast.error("Erreur lors de la modification du profil");
                  }
                }
              }} className="w-full flex flex-col items-center">
                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="username" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Nom d'utilisateur :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="text"
                    placeholder={user?.user_name || ""}
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {profileErrors.user_name && <p className="text-red-600 text-sm mt-2">{profileErrors.user_name}</p>}
                </div>

                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="email" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">E-mail :</label>
                  <input
                    className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                    type="email"
                    placeholder={user?.email || ""}
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {profileErrors.email && <p className="text-red-600 text-sm mt-2">{profileErrors.email}</p>}
                </div>

                <div className="flex flex-col mb-4 w-3/4">
                  <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-['Lobster'] font-semibold">Nouveau mot de passe :</label>
                  <div className="relative">
                    <input
                      className="h-8 md:h-10 text-base md:text-xl p-2 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="Laissez vide pour ne pas changer"
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-skill-text-primary hover:text-skill-secondary transition-colors cursor-pointer"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {profileErrors.password && <p className="text-red-600 text-sm mt-2">{profileErrors.password}</p>}
                </div>

                <div className="flex flex-row justify-center items-center mt-4">
                  <button 
                    type="submit" 
                    className="font-['Lobster'] text-xl md:text-2xl py-2 px-6 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>

              {/* Bouton supprimer le compte */}
              <section className="mt-8 text-center border-t border-skill-secondary/30 pt-6">
                <button
                  onClick={deleteAccount}
                  disabled={deleteLoading}
                  className="bg-skill-danger text-white border-none py-2 px-4 rounded cursor-pointer text-sm font-['Lobster'] hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Suppression en cours..." : "Supprimer mon compte"}
                </button>
              </section>
            </div>
          </div>
        </section>
      )}

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