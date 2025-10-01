import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
import { useAuth } from "../services/api.jsx";

export default function EditReply() {
  const { topicId, replyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Charger les données de la réponse à modifier
  useEffect(() => {
    const fetchReply = async () => {
      try {
        const topic = await forumService.getTopicById(topicId);
        const reply = topic.replies.find(r => r.id === parseInt(replyId));
        
        if (!reply) {
          toast.error("Réponse introuvable");
          navigate(`/forum/${topicId}`);
          return;
        }

        // Vérifier que l'utilisateur peut modifier cette réponse
        if (user.id !== reply.user_id && user.role_id !== 1) {
          toast.error("Vous n'avez pas l'autorisation de modifier cette réponse");
          navigate(`/forum/${topicId}`);
          return;
        }

        setContent(reply.content);
      } catch (err) {
        console.error("❌ Erreur récupération réponse →", err);
        toast.error("Erreur lors du chargement de la réponse");
        navigate(`/forum/${topicId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReply();
  }, [topicId, replyId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await forumService.updateReply(topicId, replyId, { content });
      toast.success("Réponse modifiée avec succès !");
      navigate(`/forum/${topicId}`);
    } catch (err) {
      console.error("❌ Erreur modification réponse →", err);
      
      if (err.response && err.response.data) {
        const { data } = err.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la modification de la réponse");
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
          <h2>Modifier la réponse</h2>
        </section>

        <section className="lessons">
          <form onSubmit={handleSubmit}>
            <div className="form">
              <label htmlFor="content">Message :</label>
              <textarea
                id="content"
                placeholder="Votre message"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              {errors.text && <p style={{ color: "red" }}>{errors.text}</p>}
            </div>

            <div className="see-more">
              <button type="submit" className="main-button">
                Modifier la réponse
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
