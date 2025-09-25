import React, { useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";

export default function ForumTopicsList({topics}) {

  const [topicsList, setTopicsList] = useState(Array.isArray(topics) ? topics : []);

  // Récupération des données utilisateur
  const {user} = useAuth();

  // Récupération de la liste des sujets
useEffect(() => {
  const fetchTopics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forum`,{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les messages.");
      }

      const data = await response.json();
      console.log(data);

      setTopicsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(" Erreur de récupération :", err);
    }
  };
  
  fetchTopics();
}, []);

  // Supprimer un sujet
  const handleClickDelete = async (topicId) => { 
    const isSure = confirm("Êtes-vous sûr(e) de vouloir supprimer ce sujet ?");
    if (!isSure) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression du sujet");
      }
      
      // Mise à jour de la liste locale après suppression
      setTopicsList((prev) => prev.filter((topic) => topic.id !== topicId));
      toast.success("Sujet supprimé avec succès !");

    } catch (err) {
      console.error("❌ Erreur suppression →", err.message);
      toast.error("Erreur lors de la suppression : " + err.message);
    }
  }

  return (
    <>
      <Header />
      <main>
      <section className="head-button">
          <Link to="/forum-new-discussion">
            <button className="main-button">
            Créer un nouveau sujet
            </button>
          </Link>
        </section>
        <section className="forum-banner head-banner">
          <h2>Nos sujets</h2>
        </section>

        <section className="list-category">       
          {topicsList.length === 0 ? (
            <p>Aucun sujet pour le moment.</p>
          ) : topicsList.map((topic) => (
            <section className="forum-box category-box" key={topic.id}>
              <div className="topic-box__desc">
                <h4>{(topic.title || "").replace(/^./, (match) => match.toUpperCase())}</h4>
                <div className="topic-box__center">
                  <p></p>
                  <Link
                  to={`/forum/${topic.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  >
                  <p>{(topic.content || "").replace(/^./, (match) => match.toUpperCase())}</p>
                  </Link>
                  {/* Affiche les boutons de suppression si l'utilisateur est admin ou instructeur */}
                  {user && (user.role_id === 1 || user.role_id === 2) && (
                    <button 
                      onClick={() => handleClickDelete(topic.id)} 
                      className="delete-button"
                      title="Supprimer ce sujet"
                      style={{ 
                        cursor: 'pointer', 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '1.2em',
                        color: '#e74c3c'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </section>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}