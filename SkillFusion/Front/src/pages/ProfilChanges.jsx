import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import api from "../services/axios.js";

export default function ProfilChange() {
  const [username, setUsername] = useState("");
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Récupération des données utilisateur
  const {user, setUser} = useAuth();
 
  const navigate = useNavigate();

  // Fonction pour l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // ✅ Vérification qu'au moins un champ est modifié
    if (!username && !email && !password) {
      toast.error("Veuillez modifier au moins un champ");
      return;
    }

    // Préparer les données à envoyer (seulement les champs modifiés)
    const updateData = {};
    if (username) updateData.user_name = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    try {
      // Utiliser le service axios configuré
      const response = await api.patch(`/users/${user.id}`, updateData);
      
      console.log("✅ Modification réussie:", response.data);

      // Récupérer les données utilisateur mises à jour depuis le serveur
      const updatedUserResponse = await api.get('/me');
      const updatedUserData = updatedUserResponse.data;

      // Mettre à jour le contexte avec les nouvelles données
      setUser(updatedUserData);

      // Mettre à jour le localStorage avec les nouvelles données
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      // Message de succès personnalisé selon les champs modifiés
      const modifiedFields = [];
      if (username) modifiedFields.push("nom d'utilisateur");
      if (email) modifiedFields.push("email");
      if (password) modifiedFields.push("mot de passe");
      
      const message = `Modification réussie ! ${modifiedFields.join(", ")} ${modifiedFields.length > 1 ? "ont été" : "a été"} mis à jour ✅`;
      toast.success(message);
      navigate("/board"); // Redirection

    } catch (error) {
      console.error("❌ Erreur modification profil:", error);
      
      // Gestion des erreurs spécifiques
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400 && data.errors) {
          // Erreurs de validation
          setErrors(data.errors);
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Erreur lors de la modification du profil");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
  };
  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-col justify-center items-center">
          <h2 className="font-display text-center text-2xl md:text-4xl my-8">Modifier mon profil</h2>
        </section>

        <section className="w-full max-w-[900px] mx-auto px-4">
          <div className="bg-skill-tertiary border-2 border-skill-success/50 rounded-lg p-6 md:p-8 shadow-lg">
            <form method="post" onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col items-center">
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="username" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">User Name :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="text"
                placeholder={`${user.user_name}`}
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.user_name && <p className="text-red-600 text-sm mt-2">{errors.user_name}</p>}            
              </div>
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="mail" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">E-mail :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="email"
                placeholder={`${user.email}`}
                name="email"
                id="email"
                value={email}
                onChange={(e) => setMail(e.target.value)}
              />
            {errors.email && <p className="text-red-600 text-sm mt-2">{errors.email}</p>}            
              </div>
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-semibold">Nouveau mot de passe :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                type="password"
                placeholder="Laissez vide pour ne pas changer"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
             {errors.password && <p className="text-red-600 text-sm mt-2">{errors.password}</p>}
            </div>
            <section className="flex flex-row justify-center items-center">
              <div>
                <button 
                  type="submit" 
                  className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </section>
          </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

