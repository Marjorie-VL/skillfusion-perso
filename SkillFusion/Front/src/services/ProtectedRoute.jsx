import { useAuth } from "./api.jsx";
import ErrorPage from "../components/ErrorPage.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Pendant le chargement des données utilisateur, on affiche un message
  if (loading) return <div>Chargement...</div>;

  // Si l'utilisateur n'est pas connecté, on affiche la page 404 (ou un accès refusé)
  if (!user) return <ErrorPage />;

  // Si l'utilisateur est connecté, on affiche le contenu protégé
  return children;
}
