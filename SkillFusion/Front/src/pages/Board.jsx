import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminDashboard from "../components/AdminDashboard.jsx";
import InstructorDashboard from "../components/InstructorDashboard.jsx";
import UserDashboard from "../components/UserDashboard.jsx";
import { authService } from "../services/authService.js";
import { userService } from "../services/userService.js";

export default function Board() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const ADMIN_ROLE_ID = 1;
  const INSTRUCTOR_ROLE_ID = 2;
  const USER_ROLE_ID = 3;

  const fetchAccount = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUserData(data);
    } catch (err) {
      console.error("❌ Erreur récupération compte →", err);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Erreur lors du chargement de votre profil.");
      }
      setError(err.message);
    }
  }, [navigate]);

  const fetchAllUsers = useCallback(async () => {
    try {
      console.log('🔍 Frontend - Fetching all users...');
      const data = await userService.getAllUsers();
      console.log('🔍 Frontend - Received users data:', data);
      setUsersData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Erreur récupération utilisateurs →", err);
      
      if (err.response && err.response.status === 401) {
        navigate("/login");
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Erreur lors du chargement des utilisateurs.");
      }
      setError(err.message);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Toujours récupérer les données de l'utilisateur connecté
        await fetchAccount();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchAccount]);

  // Récupérer les utilisateurs seulement si c'est un admin
  useEffect(() => {
    if (userData?.role_id === ADMIN_ROLE_ID) {
      fetchAllUsers();
    }
  }, [userData, fetchAllUsers]);

  if (isLoading) {
    return (
      <div className="text-center p-8 text-xl text-gray-600">
        <p>🔄 Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-700 bg-red-50 rounded-lg m-8 border border-red-200">
        <p>❌ Erreur : {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700 transition-colors"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  // Vérification de sécurité : s'assurer que l'utilisateur a un rôle valide
  if (!userData || ![ADMIN_ROLE_ID, INSTRUCTOR_ROLE_ID, USER_ROLE_ID].includes(userData.role_id)) {
    return (
      <div className="text-center p-8 text-red-700 bg-red-50 rounded-lg m-8 border border-red-200">
        <p>❌ Rôle utilisateur non reconnu. Veuillez contacter un administrateur.</p>
        <button 
          onClick={() => navigate("/login")} 
          className="mt-4 py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700 transition-colors"
        >
          🔐 Se reconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />      
      <main className="flex-grow">
        {userData.role_id === ADMIN_ROLE_ID && (
          <AdminDashboard usersData={usersData} />
        )}
        {userData.role_id === INSTRUCTOR_ROLE_ID && (
          <InstructorDashboard />
        )}
        {userData.role_id === USER_ROLE_ID && (
          <UserDashboard favoriteLessons={userData.favorite_lessons} user={userData}/>
        )}
      </main>
      <Footer />
    </div>
  );
}
