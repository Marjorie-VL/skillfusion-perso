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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <section className="flex flex-col justify-center items-center">
          <h2 className="my-8 font-display text-center text-2xl md:text-4xl">Créer un compte</h2>
        </section>

        <section className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
          <form method="post" onSubmit={handleSubmit} className="w-full max-w-[850px] flex flex-col items-center bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="user_name" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Nom d'utilisateur :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                type="text"
                placeholder="Votre nom d'utilisateur (3-30 caractères)"
                name="user_name"
                id="user_name"
                value={user_name}
                onChange={(e) => setUser_name(e.target.value)}
                required
                disabled={loading}
              />
              {errors.user_name && <p className="text-skill-danger text-sm mt-2">{errors.user_name}</p>}
            </div>
            
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="mail" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">E-mail :</label>
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                type="email"
                placeholder="votre.email@exemple.com"
                name="mail"
                id="mail"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
                disabled={loading}
              />
              {errors.mail && <p className="text-skill-danger text-sm mt-2">{errors.mail}</p>}
            </div>
            
            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Mot de passe :</label>
              <div className="relative">
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-1 pr-10 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 12 caractères avec majuscule, minuscule, chiffre et symbole"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-skill-text-secondary hover:text-skill-secondary focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-skill-danger text-sm mt-2">{errors.password}</p>}
            </div>

            <div className="flex flex-col mb-2 w-3/4">
              <label htmlFor="confirmPassword" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Confirmer le mot de passe :</label>
              <div className="relative">
                <input
                  className="h-8 md:h-10 text-base md:text-xl p-1 pr-10 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent disabled:opacity-50"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-skill-text-secondary hover:text-skill-secondary focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-skill-danger text-sm mt-2">{errors.confirmPassword}</p>}
            </div>

            {/* Affichage des erreurs globales */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-skill-danger/10 border border-skill-danger/30 rounded-lg p-4 mb-4 w-3/4">
                <h4 className="text-skill-danger mb-2 font-semibold">Veuillez corriger les erreurs suivantes :</h4>
                <ul className="text-skill-danger list-disc pl-6 m-0">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <section className="flex flex-row justify-center items-center">
              <div>
                <button 
                  type="submit" 
                  className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </div>
              <div className="text-center mt-4 w-full">
                <p className="text-skill-text-secondary text-sm">
                  Déjà un compte ? <a href="/login" className="text-skill-secondary no-underline hover:text-skill-accent">Se connecter</a>
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

