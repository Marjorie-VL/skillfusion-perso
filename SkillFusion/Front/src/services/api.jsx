import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data) {
        setUser(data); // ou `data.user` si ton backend retourne un objet { user, isAuthenticated }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur auth:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

   // Fonction de déconnexion
   const logout = () => {
    localStorage.removeItem("token"); // Supprimer le token du localStorage
    setUser(null); // Réinitialiser l'état de l'utilisateur
    navigate("/"); // Redirection
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
