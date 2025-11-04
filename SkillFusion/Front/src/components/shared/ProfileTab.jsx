import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/axios.js";
import DeleteAccountSection from "./DeleteAccountSection.jsx";

/**
 * Composant réutilisable pour l'onglet de profil
 * @param {Object} user - Objet utilisateur
 * @param {function} setUser - Fonction pour mettre à jour l'utilisateur dans le contexte
 */
export default function ProfileTab({ user, setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Initialiser les valeurs du formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setUsername(user.user_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
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
  };

  return (
    <section className="mb-8">
      <h2 className="font-display text-center text-2xl md:text-3xl my-8">Mon Profil</h2>
      
      <div className="w-full max-w-[900px] mx-auto px-4">
        <div className="bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
          <form method="post" onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <div className="flex flex-col mb-4 w-3/4">
              <label htmlFor="username" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Nom d'utilisateur :</label>
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
              <label htmlFor="email" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">E-mail :</label>
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
              <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Nouveau mot de passe :</label>
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
                className="font-display text-xl md:text-2xl py-2 px-6 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>

          <DeleteAccountSection />
        </div>
      </div>
    </section>
  );
}

