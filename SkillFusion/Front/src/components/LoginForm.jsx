import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api"; 
import { toast } from "react-toastify";
import { authService } from "../services/authService.js";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Connexion
      const loginData = await authService.login({ email, password });
      localStorage.setItem("token", loginData.token);

      // Récupération du profil utilisateur
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      toast.success("Connexion réussie !");
      navigate("/");
      
    } catch (error) {
      console.error("Erreur connexion:", error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        // Erreur d'authentification (email ou mot de passe non reconnu)
        if (status === 401) {
          toast.error("L'email ou le mot de passe n'est pas reconnu. Veuillez vous inscrire si ce n'est pas encore le cas.");
        }
        // Autres erreurs serveur
        else {
          toast.error(data?.error || "Une erreur s'est produite lors de la connexion.");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="w-screen flex flex-col md:flex-row md:flex-wrap justify-center items-center">
        <form onSubmit={handleSubmit} action="#" method="post" className="w-full max-w-[850px] flex flex-col items-center bg-skill-tertiary/30 border-2 border-skill-success/30 rounded-lg p-6 md:p-8 shadow-lg">
          <div className="flex flex-col mb-2 w-3/4">
            <label htmlFor="email" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">E-mail :</label>
            <input
              className="h-8 md:h-10 text-base md:text-xl p-1 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col mb-2 w-3/4">
            <label htmlFor="password" className="text-xl md:text-2xl mb-1 text-skill-text-primary font-display font-semibold">Mot de passe :</label>
            <div className="relative">
              <input
                className="h-8 md:h-10 text-base md:text-xl p-1 pr-10 my-2 w-full border border-skill-secondary rounded focus:outline-none focus:ring-2 focus:ring-skill-accent"
                placeholder="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-skill-text-secondary hover:text-skill-secondary focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
          </div>
          <section className="flex flex-row justify-center items-center">
            <button 
              type="submit" 
              className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white w-[20vw] m-4 rounded hover:bg-skill-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Connexion"}
            </button>
          </section>
        </form>
      </section>
      
    </>
  );
}
