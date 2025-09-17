import { Navigate } from "react-router-dom";
import { useAuth } from "./api.jsx";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Pendant le chargement des données utilisateur, on affiche un message
  if (loading) return <div>Chargement...</div>;

  // Si l'utilisateur est déjà connecté, on le redirige vers la page d'accueil
  if (user) return <Navigate to="/" />;

  // Sinon, on autorise l'accès à la page publique (ex: login ou register)
  return children;
}
