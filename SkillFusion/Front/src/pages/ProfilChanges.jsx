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
      <main>
        <section className="head-banner">
          <h2>Modifier mon profil</h2>
        </section>

        <section className="lessons">
          <form method="post" onSubmit={(e) => handleSubmit(e)}>
            <div className="form">
              <label htmlFor="username">User Name :</label>
              <input
                className="search-bar input-bar"
                type="text"
                placeholder={`Actuel: ${user.user_name}`}
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.user_name && <p style={{ color: "red" }}>{errors.user_name}</p>}            
              </div>
            <div className="form">
              <label htmlFor="mail">E-mail :</label>
              <input
                className="search-bar input-bar"
                type="email"
                placeholder={`Actuel: ${user.email}`}
                name="email"
                id="email"
                value={email}
                onChange={(e) => setMail(e.target.value)}
              />
            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}            
              </div>
            <div className="form">
              <label htmlFor="password">Nouveau mot de passe :</label>
              <input
                className="search-bar input-bar"
                type="password"
                placeholder="Laissez vide pour ne pas changer"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
             {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
            </div>
            <section className="see-more">
              <div>
                <button type="submit" className="main-button">
                  Enregistrer
                </button>
              </div>
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

