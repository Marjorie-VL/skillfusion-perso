import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forumService } from "../services/forumService.js";
// import { useNavigate } from "react-router-dom"; // Non utilisé pour le moment

export default function ForumDiscussionDetail() {
  const { topicId } = useParams(); // récupère l'ID du sujet de la discussion depuis l'URL
  const {user} = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        console.log("🌐 Récupération du topic:", topicId);
        const data = await forumService.getTopicById(topicId);
        console.log("📊 Données reçues du backend:", data);
        console.log("📊 Structure des données:", {
          id: data.id,
          title: data.title,
          content: data.content,
          user: data.user,
          replies: data.replies,
          repliesCount: data.replies?.length || 0
        });
        
        setTopic(data);
      } catch (err) {
        console.error("❌ Erreur récupération →", err);
        
        if (err.response && err.response.status === 401) {
          console.error("❌ Token invalide ou expiré");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          toast.error("Impossible de charger la question ! " + (err.response?.data?.error || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  if (loading) return <p>Chargement...</p>;
  if (!topic) return <p>Aucune donnée trouvée.</p>;
  
  // Debug: Vérifier la structure du topic
  console.log("🔍 Topic actuel:", topic);
  console.log("🔍 Topic.replies:", topic.replies);

  // Fonction pour envoyer une réponse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset erreurs

    if (!reply.trim()) return; // évite les messages vides

    try {
      await forumService.addReply(topicId, { content: reply });

      // Message de succès
      setReply(""); // reset le champ
      toast.success("Réponse envoyée !");

      // Re-fetch de la discussion complète avec toutes les réponses à jour
      const updatedData = await forumService.getTopicById(topicId);
      console.log("🔄 Données mises à jour après ajout de réponse:", updatedData);
      setTopic(updatedData);

    } catch (error) {
      console.error("❌ Erreur ajout réponse →", error);
      
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.errors) {
          setErrors(data.errors);
          toast.error("Veuillez corriger les erreurs dans le formulaire");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de l'envoi de la réponse");
        }
      } else if (error.request) {
        toast.error("Erreur de connexion. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite.");
      }
    }
    }

    // Modifier une réponse
    const handleClickEditReply = (topicId, replyId) => {
      navigate(`/forum/${topicId}/edit-reply/${replyId}`);
    };

    // Supprimer un sujet
    const handleClickDeleteTopic = async (topicId) => { 
      const isSure = confirm("Êtes-vous sûr(e) de vouloir supprimer ce sujet ? Cette action supprimera également toutes les réponses.");
      if (!isSure) return;

      try {
        await forumService.deleteTopic(topicId);
        toast.success("Sujet supprimé avec succès !");
        navigate("/forum");

      } catch (err) {
        console.error("❌ Erreur suppression →", err);
        toast.error("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
      }
    };

    // Supprimer une réponse
    const handleClickDelete = async (topicId, replyId) => { 
      const isSure = confirm("Êtes-vous sûr(e) de vouloir supprimer cette réponse ?");
      if (!isSure) return;

      try {
        await forumService.deleteReply(topicId, replyId);
        toast.success("Réponse supprimée avec succès !");

        // Recharger la page pour mettre à jour la liste des réponses
        window.location.reload();

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
          <Link to="/forum">
            <button className="main-button">
                Retour à la liste des sujets
            </button>
          </Link>
        </section>
        {/* Sujet */}
        <section className="head-banner">
          <h3>{topic.title.replace(/^./, (match) => match.toUpperCase())}</h3>
          <section className="category-box">
            <div className="category-box__title">
              <p className="forum-post__datas">
                Créé par : {topic.user?.user_name || "Utilisateur inconnu"}
              </p>
              <p className="forum-post__datas">
                Le : {new Date(topic.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="category-box__desc">
              <h4>{topic.content.replace(/^./, (match) => match.toUpperCase())}</h4>
              
              {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
              {user && (user.id === topic.user_id || user.role_id === 1) && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => navigate(`/forum/edit/${topic.id}`)} 
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
                    onClick={() => handleClickDeleteTopic(topic.id)} 
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
          </section>
        </section>
        {/* Réponses */}
        <section className="list-category">
          {topic.replies && topic.replies.length > 0 ? (
            topic.replies.map((reply) => (
            <section className="category-box" key={reply.id}>
              <div className="category-box__title">
                <p className="forum-post__datas">
                  Posté par : {reply.user?.user_name || "Utilisateur inconnu"}
                </p>
                <p className="forum-post__datas">
                  Le : {new Date(reply.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="category-box__desc">
                <p>{reply.content.replace(/^./, (match) => match.toUpperCase())}</p>

                {/* Affiche les boutons de modification/suppression si l'utilisateur est propriétaire ou admin */}
                {user && (user.id === reply.user_id || user.role_id === 1) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      onClick={() => handleClickEditReply(topic.id, reply.id)} 
                      className="edit-button"
                      title="Modifier cette réponse"
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
                      onClick={() => handleClickDelete(topic.id, reply.id)} 
                      className="delete-button"
                      title="Supprimer cette réponse"
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
            </section>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              Aucune réponse pour le moment. Soyez le premier à répondre !
            </p>
          )}

          {/* Formulaire pour envoyer une réponse */}
          <section className="forum-post__form">
            <form onSubmit={handleSubmit}>
              <div className="forum-post__textarea">
                <textarea
                  id="reply"
                  placeholder="Votre message"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  required
                />
              {errors.content && (
                <p style={{ color: "red" }}> {typeof errors.content === "string" ? errors.content : JSON.stringify(errors.content)}</p>)}
              </div>
              <div className="forum-post__button">
                <button className="main-button" type="submit">
                  Envoyer
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}