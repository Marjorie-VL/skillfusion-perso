import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
import { useAuth } from "../services/api.jsx";

export default function EditTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Charger les données du sujet à modifier
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const topic = await forumService.getTopicById(topicId);
        
        // Vérifier que l'utilisateur peut modifier ce sujet
        if (user.id !== topic.user_id && user.role_id !== 1) {
          toast.error("Vous n'avez pas l'autorisation de modifier ce sujet");
          navigate("/forum");
          return;
        }

        setTitle(topic.title);
        setContent(topic.content);
      } catch (err) {
        console.error("❌ Erreur récupération sujet →", err);
        toast.error("Erreur lors du chargement du sujet");
        navigate("/forum");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await forumService.updateTopic(topicId, { title, content });
      toast.success("Sujet modifié avec succès !");
      navigate(`/forum/${topicId}`);
    } catch (err) {
      console.error("❌ Erreur modification sujet →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la modification du sujet");
        }
      } else if (err.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Chargement...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <section className="head-banner">
          <h2>Modifier le sujet</h2>
        </section>

        <section className="lessons">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <label htmlFor="title">Sujet :</label>
              <input
                className="search-bar input-bar"
                type="text"
                id="title"
                placeholder="Titre du sujet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}
            </div>

            <div className="form">
              <label htmlFor="content">Message :</label>
              <textarea
                id="content"
                placeholder="Message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              {errors.text && <p style={{ color: "red" }}>{errors.text}</p>}
            </div>

            <div className="see-more">
              <button type="submit" className="main-button">
                Modifier le sujet
              </button>
              <button 
                type="button" 
                className="main-button" 
                onClick={() => navigate(`/forum/${topicId}`)}
                style={{ marginLeft: "10px", backgroundColor: "#6c757d" }}
              >
                Annuler
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
