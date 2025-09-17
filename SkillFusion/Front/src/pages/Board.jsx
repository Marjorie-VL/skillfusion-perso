import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard.jsx";
import UserDashboard from "../components/UserDashboard.jsx";

export default function Board() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAccount();
        await fetchAllUsers();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur réseau ou autorisation");
      setUserData(await response.json());
    } catch (err) {
      if (err.message.includes("401")) {
        navigate("/login");
      }      
      setError(err.message);
    }
  };

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
      setUsersData((await response.json()).allUsers || []);
    } catch (err) {
      if (err.message.includes("401")) {
        navigate("/login");
      }      
      setError(err.message);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <>
      <Header />      
      <main>
      <section className="head-button">
      {userData?.role_id === 1 ? (
        <Link to="/erreurMaintenance">
          <button className="main-button">Créer un nouveau cours</button>
        </Link>
      ):(
        <p></p>
      )}
      </section>
      <section className="head-button">
        <Link to="/profilchanges">
          <button className="main-button">Modifier mon profil</button>
        </Link>
      </section>

        {userData?.role_id === 1 ? (
          <AdminDashboard usersData={usersData} />
        ) : (
          <UserDashboard favoriteLessons={userData.favorite_lessons} user={userData}/>
        )}
      </main>
      <Footer />
    </>
  );
}