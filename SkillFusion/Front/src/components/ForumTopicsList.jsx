import React, { useState, useEffect} from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/api.jsx";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";


export default function ForumTopicsList({topics}) {

  const [topicsList, setTopicsList] = useState(Array.isArray(topics) ? topics : []);
  const navigate = useNavigate();

  // Récupération des données utilisateur
  const {user} = useAuth();

  // Récupération de la liste des sujets
useEffect(() => {
  const fetchTopics = async () => {
    try {
      const data = await forumService.getAllTopics();
      console.log(data);

      setTopicsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(" Erreur de récupération :", err);
    }
  };
  
  fetchTopics();
}, []);

  // Modifier un sujet
  const handleClickEdit = (topicId) => {
    navigate(`/forum/edit/${topicId}`);
  };

  // Supprimer un sujet
  const handleClickDelete = async (topicId) => { 
    const isSure = confirm("Êtes-vous sûr(e) de vouloir supprimer ce sujet ?");
    if (!isSure) {
      return;
    }
    
    try {
      await forumService.deleteTopic(topicId);
      
      // Mise à jour de la liste locale après suppression
      setTopicsList((prev) => prev.filter((topic) => topic.id !== topicId));
      toast.success("Sujet supprimé avec succès !");

    } catch (err) {
      console.error("❌ Erreur suppression →", err);
      toast.error("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
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
                  {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
                  {user && (user.id === topic.user_id || user.role_id === 1) && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button 
                        onClick={() => handleClickEdit(topic.id)} 
                        className="edit-button"
                        title="Modifier ce sujet"
                        style={{ 
                          cursor: 'pointer', 
                          background: 'none', 
                          border: 'none', 
                          fontSize: '1.2em',
                          color: '#3498db'
                        }}
                      >
                        ✏️
                      </button>
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
                    </div>
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