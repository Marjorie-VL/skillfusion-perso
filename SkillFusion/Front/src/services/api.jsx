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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data) {
        setUser(data);
        // Mettre à jour le localStorage avec les données utilisateur
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem('user');
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
    localStorage.removeItem("user"); // Supprimer les données utilisateur du localStorage
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
