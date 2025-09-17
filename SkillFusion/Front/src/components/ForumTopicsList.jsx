import React, { useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";

export default function ForumTopicsList({topics}) {

  const [topicsList, setTopicsList] = useState(
    topics?.topics || topics || []
  );

  // Récupération des données utilisateur
  const {user} = useAuth();
  const [error, setError] = useState(null);

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
      setTopicsList(data.forums);
    } catch (err) {
      console.error(" Erreur de récupération :", err);
      setError(err.message);
    }
  };
  
  fetchTopics();
}, []);

  // Supprimer un sujet
  const handleClickDelete = async (topicId) => { 
    let isSure = confirm("Etes-vous sûr(e) ?");
    if(!isSure){
      return
    }else{
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}`,{
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        // body: JSON.stringify({user }),
        });
          if (!response.ok) {
            throw new Error("Erreur lors de la suppression du message");
          }
        // Mise à jour de la liste locale après suppression
            setTopicsList((prev) =>
            prev.filter((topic) => topic.id !== topicId)  
          );
        toast.success("Suppression du message réussie !");

      } catch (err) {
        (err.message);
      }
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
          {topicsList.map((topic) => (
            <section className="forum-box category-box" key={topic.id}>
              <div className="topic-box__desc">
                <h4>{topic.title.replace(/^./, (match) => match.toUpperCase())}</h4>
                <div className="topic-box__center">
                  <p></p>
                  <Link
                  to={`/forum/${topic.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  >
                  <p>{topic.text.replace(/^./, (match) => match.toUpperCase())}</p>
                  </Link>
                  {/* Affiche les boutons de CRD si l'utilisateur a les droits d'admin*/}
                  {user ? (
                    <a onClick={() => handleClickDelete(topic.id)} style={{ cursor: 'pointer' }}>
                      <div className="crud">
                      <p></p>
                      <h4>{((user.role_id === 1)) ?("\ud83d\uddd1"):(" ")}</h4>
                    </div>
                    </a>
                    ):(
                    <p></p>
                    )
                  }
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