import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/api"; 
import { toast } from "react-toastify";
import { authService } from "../services/authService.js";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      
      if (error.response && error.response.status === 401) {
        toast.error("Email ou mot de passe incorrect");
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
      <section className="lessons">
        <form onSubmit={handleSubmit} action="#" method="post">
          <div className="form">
            <label htmlFor="email">E-mail :</label>
            <input
              className="search-bar input-bar"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form">
            <label htmlFor="password">Mot de passe :</label>
            <input
              className="search-bar input-bar"
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <section className="see-more">
            <button 
              type="submit" 
              className="main-button"
              disabled={loading}
              style={{ 
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Connexion en cours..." : "Connexion"}
            </button>
          </section>
        </form>
      </section>
      
    </>
  );
}
