import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";

export default function Register() {
  const [user_name, setUser_name] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validation côté client
  const validateForm = () => {
    const newErrors = {};

    // Validation du nom d'utilisateur
    if (!user_name.trim()) {
      newErrors.user_name = "Le nom d'utilisateur est requis";
    } else if (user_name.length < 3) {
      newErrors.user_name = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    } else if (user_name.length > 30) {
      newErrors.user_name = "Le nom d'utilisateur ne doit pas dépasser 30 caractères";
    }

    // Validation de l'email
    if (!mail.trim()) {
      newErrors.mail = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      newErrors.mail = "L'email n'est pas valide";
    }

    // Validation du mot de passe
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 12) {
      newErrors.password = "Le mot de passe doit contenir au moins 12 caractères";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un symbole";
    } else if (/\s/.test(password)) {
      newErrors.password = "Le mot de passe ne doit pas contenir d'espaces";
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  };

  // Fonction pour l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation côté client
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.register({
        user_name: user_name,
        email: mail,
        password: password
      });

      // Succès
      console.log("Inscription réussie:", data);
      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate("/login");
      
    } catch (error) {
      console.error("Erreur inscription:", error);
      
      // Gestion des erreurs Axios
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Erreur lors de l'inscription");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Veuillez vérifier votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Créer un compte</h2>
        </section>

        <section className="lessons">
          <form method="post" onSubmit={handleSubmit}>
            <div className="form">
              <label htmlFor="user_name">Nom d'utilisateur :</label>
              <input
                className="search-bar input-bar"
                type="text"
                placeholder="Votre nom d'utilisateur (3-30 caractères)"
                name="user_name"
                id="user_name"
                value={user_name}
                onChange={(e) => setUser_name(e.target.value)}
                required
                disabled={loading}
              />
              {errors.user_name && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.user_name}</p>}
            </div>
            
            <div className="form">
              <label htmlFor="mail">E-mail :</label>
              <input
                className="search-bar input-bar"
                type="email"
                placeholder="votre.email@exemple.com"
                name="mail"
                id="mail"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
                disabled={loading}
              />
              {errors.mail && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.mail}</p>}
            </div>
            
            <div className="form">
              <label htmlFor="password">Mot de passe :</label>
              <input
                className="search-bar input-bar"
                type="password"
                placeholder="Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {errors.password && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.password}</p>}
            </div>

            <div className="form">
              <label htmlFor="confirmPassword">Confirmer le mot de passe :</label>
              <input
                className="search-bar input-bar"
                type="password"
                placeholder="Répétez votre mot de passe"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              {errors.confirmPassword && <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>{errors.confirmPassword}</p>}
            </div>

            {/* Affichage des erreurs globales */}
            {Object.keys(errors).length > 0 && (
              <div style={{ 
                backgroundColor: "#fdf2f2", 
                border: "1px solid #fecaca", 
                borderRadius: "8px", 
                padding: "1rem", 
                marginBottom: "1rem" 
              }}>
                <h4 style={{ color: "#dc2626", margin: "0 0 0.5rem 0" }}>Veuillez corriger les erreurs suivantes :</h4>
                <ul style={{ color: "#dc2626", margin: 0, paddingLeft: "1.5rem" }}>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <section className="see-more">
              <div>
                <button 
                  type="submit" 
                  className="main-button"
                  disabled={loading}
                  style={{ 
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Déjà un compte ? <a href="/login" style={{ color: "#1976d2", textDecoration: "none" }}>Se connecter</a>
                </p>
              </div>
            </section>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

