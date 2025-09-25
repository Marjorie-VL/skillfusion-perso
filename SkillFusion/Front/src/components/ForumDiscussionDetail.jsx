import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom"; // Non utilisé pour le moment

export default function ForumDiscussionDetail() {
  const { topicId } = useParams(); // récupère l'ID du sujet de la discussion depuis l'URL
  const {user} = useAuth();
  const [topic, setTopic] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  // const navigate = useNavigate(); // Non utilisé pour le moment
  
  useEffect(() => {
    const fetchTopic = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = `${import.meta.env.VITE_API_URL}/forum/${topicId}`;
      
      console.log("🌐 URL de l'API:", apiUrl);
      console.log("🔑 Token présent:", !!token);
      console.log("🔑 Token value:", token ? token.substring(0, 20) + "..." : "null");

      try {
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("📡 Statut de la réponse:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            // Token expiré, redirection vers la page de connexion
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
          throw new Error("Erreur réseau ou autorisation");
        }

        const data = await response.json();
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
        toast.error("Impossible de charger la question !" + err.message);
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
    const token = localStorage.getItem("token");

    if (!reply.trim()) return; // évite les messages vides

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: reply }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error || data.message) {
          toast.error(data.error || data.message);
        } else {
          toast.error("Erreur inconnue lors de la création du message.");
        }
        return;
      }

    // Message de succès
    setReply(""); // reset le champ
    toast.success("Réponse envoyée !");

     // Re-fetch de la discussion complète avec toutes les réponses à jour
     const updatedRes = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

    if (!updatedRes.ok) throw new Error("Erreur lors du rechargement");

    const updatedData = await updatedRes.json();
    console.log("🔄 Données mises à jour après ajout de réponse:", updatedData);
    setTopic(updatedData);

    } catch (error) {
      console.error(error);
      toast.error("Impossible d'envoyer la réponse.");
    }
  }
    // Supprimer une réponse
    const handleClickDelete = async (topicId, replyId) => { 
      const isSure = confirm("Êtes-vous sûr(e) de vouloir supprimer cette réponse ?");
      if (!isSure) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/forum/${topicId}/reply/${replyId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la suppression de la réponse");
        }
        
        toast.success("Réponse supprimée avec succès !");

        // Recharger la page pour mettre à jour la liste des réponses
        window.location.reload();

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

                {/* Affiche les boutons de suppression si l'utilisateur est admin ou instructeur */}
                {user && (user.role_id === 1 || user.role_id === 2) && (
                  <button 
                    onClick={() => handleClickDelete(topic.id, reply.id)} 
                    className="delete-button"
                    title="Supprimer cette réponse"
                    style={{ 
                      cursor: 'pointer', 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '1.2em',
                      color: '#e74c3c',
                      marginLeft: '10px'
                    }}
                  >
                    🗑️
                  </button>
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